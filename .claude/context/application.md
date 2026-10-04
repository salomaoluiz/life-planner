# Application layer (`src/application`)

Imports allowed: `@domain/*`, `@application/*`. Never import data/infrastructure/presentation (the only DI glue is `useCases/index.ts`).

## Use case (`useCases/cases/<module>/[<sub>/]<verb><Thing>UseCase.ts`)

A **factory function** receiving `Repositories`, returning `{ execute, uniqueName }`. Types in `useCases/types.ts`:

- `IUseCaseFactoryWithParamResponse<Params, Result>`
- `IUseCaseFactoryWithoutParamResponse<Result>`

```ts
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import Repositories from "@domain/repositories";

export interface CreateAccountUseCaseParams {
  name: string;
  owner: string; // raw strings from UI; validate/convert here
  ownerId: string;
}

function createAccountUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<CreateAccountUseCaseParams, void> {
  return {
    execute: async (params: CreateAccountUseCaseParams) => {
      const owner = OwnerType[params.owner as keyof typeof OwnerType];
      if (!owner) {
        throw new FieldInvalid({ owner });
      }
      try {
        await repositories.financialRepository.account.createAccount({
          ...params,
          owner,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.createAccountUseCase" });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.create_account_use_case",
  };
}

export default createAccountUseCase;
```

Rules:

- Validation + business rules go here (throw `FieldRequired` / `FieldInvalid` / custom `BusinessError`).
- Read use cases return **DTOs** (`entities.map((e) => XDTO.fromEntity(e))`), never entities.
- `uniqueName`: `"<module>.<snake_case_name>"` — used as React Query cache key.
- `addContext({ useCase: "<module>.<camelName>" })`.
- "Refresh" use cases just invalidate cache: `repositories.cacheRepository.invalidate({ keys: [CacheStringKeys.X] })`.
- Current user / owners: `repositories.userRepository.getUser()`; owners list via `useCases.getOwnersUseCase` (presentation).

## Registration

1. `cases/<module>/[<sub>/]index.ts`: `export { default as createAccountUseCase } from "./createAccountUseCase";`
2. Module aggregator may alias to avoid collisions (`cases/financial/index.ts` → `createAccountUseCase as createFinancialAccountUseCase`). The exported name is the public key: `useCases.createFinancialAccountUseCase`.
3. New module only: `cases/index.ts` → `import * as xUseCases from "./x"` and spread into `listUseCases`.

## DTO (`dto/<module>/XDTO.ts`)

```ts
export interface IAccountDTO {
  balance: number;
  id: string;
  owner: string; /* enums become string */
}
class AccountDTO {
  // fields...
  constructor(params: IAccountDTO) {
    /* copy */
  }
  static fromEntity(entity: AccountEntity) {
    return new AccountDTO({
      /* map */
    });
  }
}
export default AccountDTO;
```

Each DTO has `XDTO.test.ts` + `mocks/XDTO.mocks.ts` (see `testing.md`).

## Providers (`application/providers`)

`UserProvider` / `useUser()` → `{ data?: { profile }, logged, update }`. Add new app-level contexts here and compose in `providers/index.tsx`.
