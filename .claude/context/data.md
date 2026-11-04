# Data layer (`src/data`)

> Supabase datasources are **legacy**, being replaced by datasources that call the new backend (`../life-planner-back`) through `@infrastructure/fetcher`. See `.claude/context/backend.md`; migrate by swapping the datasource only, keeping repository interfaces, use cases and UI unchanged.

Three parts, all wired by DI (see `architecture.md`):

| Part                       | Path                                                                     | Returns              |
| -------------------------- | ------------------------------------------------------------------------ | -------------------- |
| Model                      | `models/<module>/XModel.ts`                                              | DB shape ↔ camelCase |
| Datasource interface       | `repositories/repos/<module>/[<sub>/]xDatasource.ts`                     | `Promise<XModel>`    |
| Datasource impl (Supabase) | `datasource/data/<module>/[<sub>/]supabase/<method>.ts`                  | `Promise<XModel>`    |
| Repository impl            | `repositories/repos/<module>/[<sub>/]<method>.ts` + `xRepositoryImpl.ts` | `Promise<XEntity>`   |

> Two styles exist. **Use the modern one-file-per-method style** (financial, stock, user). Older modules (families, familyMember, auth) use a single `xDatasourceImpl()` object — don't copy it for new code.

## Model

Like the entity, plus `static fromJSON(data: Record<string, unknown>)` (snake_case → camelCase, cast/convert types e.g. `Number(data.balance)`) and `toJSON()` (back to snake_case; used for DB writes and cache storage).

A model can also read a lean API response that references other entities by id (spec 079): `TransactionModel.fromLeanJSON(item, lookups)` joins the item with the response `lookups` and delegates to `fromJSON`, so `toJSON()` and the cache keep the nested shape.

```ts
static fromJSON(data: Record<string, unknown>): AccountModel {
  return new AccountModel({
    balance: Number(data.balance),
    id: data.id as string,
    ownerId: data.owner_id as string,
    status: data.status as AccountStatus,
  });
}
toJSON() {
  return { balance: this.balance, id: this.id, owner_id: this.ownerId, status: this.status };
}
```

## Datasource interface (lives next to the repository impl)

`export interface AccountDatasource { createAccount(params: CreateAccountDatasourceParams): Promise<AccountModel>; ... }` + param interfaces exported at the bottom.

## Datasource method — legacy Supabase style, stock only (`datasource/data/<module>/<sub>/supabase/<method>.ts`)

```ts
import AccountModel from "@data/models/financial/AccountModel";
import { AccountDatasource } from "@data/repositories/repos/financial/accounts/accountDatasource";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<AccountDatasource["createAccount"]>[0];

async function createAccount(params: Params): Promise<AccountModel> {
  try {
    const response = await supabase
      .from("financial_accounts")
      .upsert({ name: params.name, owner_id: params.ownerId /* snake_case */ })
      .select()
      .then();
    if (response.error) throw response.error; // (use braces — see repo style)
    if (!response.data) throw new Error("Without data response");
    return AccountModel.fromJSON(response.data[0]);
  } catch (error) {
    if (error instanceof BusinessError) throw error;
    const genericError = new GenericError();
    genericError.addContext({
      datasource: "AccountDatasource - createAccount",
      error,
      params,
    });
    throw genericError;
  }
}
export default createAccount;
```

Query idioms: list → `.select().in("owner_id", ownerIds)`; delete → `.delete().eq("id", id).eq("owner_id", ownerId)`; update → `const { id, ownerId, ...rest } = params; supabase.from(t).update(rest).eq("id", id)` (add `.eq("owner_id")` if given). Always end with `.then()`.

Wiring:

- `supabase/index.ts`: `export default { createAccount, deleteAccount, getAccounts, updateAccount };`
- `<sub>/index.ts`: `export default function financialAccountDatasource() { return supabase; }`
- `<module>/index.ts`: `export { default as financialAccountDatasource } from "./accounts";`
- `datasource/data/index.ts`: spread `...<module>` into `listDatasources` (new module only).
- Add the datasource to `datasource/mocks/listDatasources.mocks.ts`.

## Repository method (`repositories/repos/<module>/<sub>/<method>.ts`)

Maps Model → Entity and handles cache.

```ts
export type Params = Parameters<FinancialAccountRepository["createAccount"]>[0];

async function createAccount(params: Params, datasources: Datasources) {
  const account = await datasources.financialAccountDatasource.createAccount({ ...mapped params });
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA);   // writes invalidate
  return new AccountEntity({ /* from model */ owner: OwnerType[account.owner] });
}
export default createAccount;
```

Read with cache:

```ts
const cached = cache.get<Array<Record<string, unknown>> | null>(CacheStringKeys.CACHE_X_DATA);
let models: XModel[];
if (cached) models = cached.map((c) => XModel.fromJSON(c));
else {
  models = await datasources.xDatasource.getX(ownerIds);
  cache.set<Record<string, unknown>[]>(CacheStringKeys.CACHE_X_DATA, models.map((m) => m.toJSON()));
}
return models.map((m) => new XEntity({ ... }));
```

`cache` = `import cache, { CacheStringKeys } from "@infrastructure/cache"` (`get`, `set`, `invalidate(key | key[], { uniqueId? })`, `invalidateAll`).

Cache write/read failures report only the key, options and byte size to monitoring, never the cached data (it holds personal/financial records).

## Repository impl (`xRepositoryImpl.ts`)

```ts
function accountRepositoryImpl(
  datasources: Datasources,
): FinancialAccountRepository {
  return {
    async createAccount(params): Promise<AccountEntity> {
      return createAccount(params, datasources);
    },
    // ...one delegating method per interface method
  };
}
export default accountRepositoryImpl;
```

Wiring: `repos/<module>/index.ts` exports a factory named exactly like the `Repositories` key (e.g. `export function financialRepository(datasources) { return { account: accountRepository(datasources), ... } }` or `export { default as stockRepository } from "./stockRepositoryImpl"`); spread into `repos/index.ts` `listRepositories` for a new module; add mocks to `repositories/mocks/listRepositories.mocks.ts`.

## API datasource method (`datasource/data/<module>/<sub>/api/<method>.ts`)

Reference: `financial/accounts/api/getAccounts.ts` — guard an empty owner list (no request), `api.get<...>(path + toOwnerQuery(ownerIds))` from `@infrastructure/api`, map with `Model.fromJSON`, and in `catch` return `handleFinancialApiError(error, { datasource, ...ids })` (ids only in the context). `<sub>/index.ts`: `import api from "./api"; export default function financialAccountDatasource() { return api; }`.

## Fetcher defaults and request sharing (spec 073)

- `queryClient` (`@infrastructure/fetcher/reactQuery/provider.tsx`): `staleTime` 30 s, `gcTime` 10 min, `retry: shouldRetry` (one retry, only for `ConnectivityError` or non-`BusinessError`; never 4xx, validation or `UserNotLoggedError`). `defaults.test.ts` locks them.
- `useQuery` passes only the options it was given (an `undefined` would override the defaults) and `refetch` joins a running fetch (`cancelRefetch: false`). A query that is never stale on its own sets `staleTime: Infinity` (the profile).
- `refetchStaleFetcherData(keyPrefixes)` refetches only the mounted (active), stale queries under those prefixes; disabled queries are skipped. Pull to refresh keeps using `refetch()`.
- `api.get` shares identical GETs (same path) while one is in flight and forgets them once settled (no cache). GETs time out after 10 s, writes after 15 s.
- `tokenStorage.getToken()` reads the store once and serves the access token from memory; `setToken` and `clearToken` keep it in sync (every writer goes through `tokenStorage`).

## Owners query (spec 074)

Owners (personal + families) come from the `families` of one `GET /v1/user/me`: `userRepository.getOwners()` never reads the cached profile (`CACHE_USER_DATA`), because families change while the profile does not. The shared query is `useOwners` (`src/presentation/hooks/useOwners`, staleTime 5 min); queries that need owners use `useOwnerScopedQuery` (enabled once owners are known, keyed by the list key plus the owner ids, so code that reads such a cache entry must build the same key). Family writes call `invalidateFetcherData()`, which refreshes the owners entry.

## Month results are not persisted (spec 075)

`financialRepository.transaction.getTransactions(ownerIds, range)` with a `range` (`monthDateRange`) reads straight from the API and writes nothing to the persistent cache: the screens keep months in React Query memory. The persisted whole-history entry (read only by the screens that still load the full history, removed by spec 077) is keyed by the sorted owner ids, and `cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA)` without a unique id still clears every entry.
