# Testing (Jest + jest-expo + @testing-library/react-native)

Global coverage threshold **90%** (branches/functions/lines/statements) — `pre-push` runs `yarn test --coverage` and CI runs `yarn test --ci --coverage`. The gate is enforced: **screens must ship with tests**, and the threshold must not be lowered, bypassed with `istanbul ignore`, or dodged by excluding source files. `*.mocks.ts(x)` and `*.fixture.ts` are excluded from coverage.

## Layout

```
X.ts
X.test.ts                 (or X_<method>.test.ts for multi-method impls)
mocks/X.mocks.ts          setup(), setupThrowable(), spies, mocks
```

Test titles: `it("SHOULD <behavior> [WHEN <condition>]", ...)`. Cover error paths (`setupThrowable`), not just the happy path.
Utilities: `import { render, screen, fireEvent, renderHook, act, waitFor, suppressConsoleError, hasText, mockDarkTheme } from "@tests";`

- `hasText(text)` — react-native-paper components are mocked as `<View>`, so `getByText` cannot see their string children; `hasText` matches on the `children` prop.
- `mockDarkTheme()` — switches the mocked `useTheme` to the dark theme; returns a restore function (call it at the end of the test).
  `tests/setup.tsx` mocks react-native-paper (components become `View`; `Banner` and `List.Accordion/List.Item` render their slots), google-signin, etc.; fake timers fixed at `2025-01-01T00:00:00Z`.

## Mock file pattern (use case example)

```ts
import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import createCategoryUseCase, {
  CreateCategoryUseCaseParams,
} from "../createCategoryUseCase";

const defaultParams: CreateCategoryUseCaseParams = {
  /* ... */
};
beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<CreateCategoryUseCaseParams>) {
  return createCategoryUseCase(repositoriesMocks).execute({
    ...defaultParams,
    ...params,
  });
}
async function setupThrowable(params?: Partial<CreateCategoryUseCaseParams>) {
  try {
    await setup(params);
  } catch (err) {
    return err;
  }
}
const spies = {
  financialRepositoryCategory: jest.mocked(
    repositoriesMocks.financialRepository.category,
  ),
};
const mocks = {
  defaultParams,
  errors: { business: new BusinessError(), unknown: new Error("Some error") },
};
export { mocks, setup, setupThrowable, spies };
```

## Per layer

| Layer                               | How to test                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Datasource (`supabase/<method>.ts`) | `jest.mock("@infrastructure/supabase", () => ({ supabase: { from: jest.fn().mockReturnThis(), select: ..., then: jest.fn().mockResolvedValue({ data, error: null }) } }))`; assert table name + mapping; test `error` → `GenericError` with context                                                                                      |
| Repository method                   | `datasourcesMocks` from `@data/datasource/mocks/index.mocks` + `jest.mocked(datasourcesMocks.xDatasource).method.mockResolvedValue(model)`; `jest.spyOn(cache, "invalidate"/"get"/"set")`; assert entity returned + cache calls                                                                                                          |
| Use case                            | `repositoriesMocks`; assert repository call args, DTO result, validation errors, `addContext` on `DefaultError`                                                                                                                                                                                                                          |
| Model / DTO / Entity                | `fromJSON`/`toJSON`/`fromEntity` mapping                                                                                                                                                                                                                                                                                                 |
| UIModel / `fetchX` functions        | plain unit tests                                                                                                                                                                                                                                                                                                                         |
| ViewModel hook / `useForm`          | `renderHook` + `act` from `@tests`; mock `@application/useCases` and `@infrastructure/fetcher`; assert returned shape and handler effects                                                                                                                                                                                                |
| View (`index.tsx`)                  | mock its `hooks` module and render the loading, error and content branches                                                                                                                                                                                                                                                               |
| Component                           | `render` + `screen.getByTestId`; mocks file exports `defaultProps`, `setup(props)`                                                                                                                                                                                                                                                       |
| Screen / modal / container          | Mock `expo-router`, `@infrastructure/fetcher` (use `UseQueryFixture`/`UseMutationFixture`), `@application/useCases` and `@shopify/flash-list` in the sibling `mocks/` file; assert use case params, `router` calls, and every loading/error/empty/success state. Import the component **from the mocks file** so `jest.mock` runs first. |

## Registries that MUST be updated when adding DI pieces

- `src/data/datasource/mocks/listDatasources.mocks.ts` — every datasource method as `jest.fn()`.
- `src/data/repositories/mocks/listRepositories.mocks.ts` — every repository method as `jest.fn()` (typed as `Repositories`, so missing ones are type errors).
- Registration tests assert the **exact** key set of each `list*` object — add every new key or they fail:
  - `src/application/useCases/cases/index.test.ts` (every public use case name, e.g. `createFinancialAccountUseCase`)
  - `src/data/datasource/data/index.test.ts` and `src/data/datasource/index.test.ts` (datasource keys)
  - `src/data/repositories/index.test.ts` (repository keys)
  - `src/application/useCases/index.test.ts`
