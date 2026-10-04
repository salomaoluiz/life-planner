# Domain layer (`src/domain`) — pure TypeScript only

No imports from React, RN, Expo, Supabase or any npm package. Only `@domain/*` imports.

## Entity (`entities/<module>/XEntity.ts`)

Class + `I<Name>Entity` interface, constructor copies params, **default export**. Enums for closed sets are exported from the same file. Properties sorted alphabetically (perfectionist lint).

```ts
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

interface IAccountEntity {
  balance: number;
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  status: AccountStatus;
}

class AccountEntity implements IAccountEntity {
  balance: number;
  // ...same fields
  constructor(params: IAccountEntity) {
    this.balance = params.balance;
    // ...
  }
}

export default AccountEntity;
```

## Repository interface (`repositories/<module>/<name>Repository.ts`)

`export type XRepository = { method(params): Promise<...> }` with `interface ...RepositoryParams` declared below and exported at the bottom.

```ts
export type FinancialAccountRepository = {
  createAccount(params: CreateAccountRepositoryParams): Promise<AccountEntity>;
  deleteAccount(params: DeleteAccountRepositoryParams): Promise<void>;
  getAccounts(ownerIds: string[]): Promise<AccountEntity[]>;
  updateAccount(params: UpdateAccountRepositoryParams): Promise<void>;
};
interface CreateAccountRepositoryParams {
  /* ... */
}
export { CreateAccountRepositoryParams, UpdateAccountRepositoryParams };
```

Then:

1. Re-export from `repositories/<module>/index.ts` (`export * from "./..."`).
2. Add it to the `Repositories` interface in `repositories/index.ts` (grouped modules use a nested object, e.g. `financialRepository: { account; category; transaction }`).

## Errors (`entities/errors`)

```
DefaultError (abstract, has code + context + addContext())
 ├─ BusinessError  (code BusinessError)  -> expected/user-facing failures
 │    ├─ FamilyNotFound, FamilyNotCreated, FieldRequired(fields), FieldInvalid(fields), LoginCanceled, UserNotLogged
 └─ GenericError   (code TechnicalError) -> unexpected/technical failures
```

New business error: `class XNotFound extends BusinessError { constructor(){ super(); this.name = "XNotFound"; } }`, put in `errors/<area>/`, export from `errors/<area>/index.ts` and `errors/index.ts`. Import errors from `@domain/entities/errors`.

## Cache keys (`entities/cache/keys.ts`)

`CacheStringKeys` enum, format `CACHE_<MODULE>_<THING>_DATA = "@cache_<module>_<thing>_data"`, keep alphabetical. Also re-exported from `@infrastructure/cache`.
