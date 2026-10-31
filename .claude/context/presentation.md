# Presentation layer — hook-based MVVM (`src/presentation/screens`)

Related: `components.md` (shared UI), `theme.md` (styles), `i18n.md` (text), `routing.md` (app/ routes).

## The three roles

| Role          | File                          | Responsibility                                                                                                                                                                         | Must NOT                                                                                               |
| ------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **View**      | `index.tsx`                   | Render only: call its ViewModel hook, `useStyles()`, `t()`; bind data/handlers to JSX; choose loading/error/content branch                                                             | import `useCases`, `@infrastructure/fetcher`, `router`; `useEffect`/`useState`; format or compute data |
| **ViewModel** | `hooks/use<Name>ViewModel.ts` | All logic: `useQuery`/`useMutation`, calling `useCases.*`, mapping DTOs → UI models, form state + validation, navigation (`router`), alerts/confirmations, focus refetch, side effects | return JSX, DTOs or raw use case results; translate static labels for the View                         |
| **Model**     | `models/<Name>UIModel.ts`     | Pure class mapping DTO(s) → display-ready getters (formatting, derived values, translation keys)                                                                                       | use hooks, React, `useCases`, or translate (return keys, not strings)                                  |

Flow: `View → use<Name>ViewModel() → useCases.* (via fetcher) → DTO → new <Name>UIModel(dto) → View`.

Every View has its own ViewModel hook: **screens, containers and modals**. Dumb `components/` stay props-only and have no hook.

## Folder anatomy

```
screens/<Area>/<Screen>/
  index.tsx                            View (default export)
  styles.ts                            useStyles() (see theme.md)
  hooks/use<Screen>ViewModel.ts        ViewModel
  hooks/index.ts                       barrel
  models/<Thing>UIModel.ts             UI models
  containers/<Name>/
    index.tsx                          View
    hooks/use<Name>ViewModel.ts        ViewModel (receives the container props)
    styles.ts
  components/<Name>/                   dumb, props in / callbacks out, no hook
  modals/
    index.ts                           export { default as NewXModal } from "./NewXModal";
    NewXModal/
      index.tsx                        View
      hooks/useNewXViewModel.ts        ViewModel (route params, form, save mutation)
      hooks/useForm.ts                 form state + validateForm() (used by the ViewModel, not the View)
      models/NewXUIModel.ts            picker options etc.
      styles.ts
```

`index.web.tsx` variants (Metro picks them automatically) reuse the same ViewModel hook; only the rendering differs.
Register the screen in `screens/index.tsx`.

> **Legacy code:** many screens still have logic in `index.tsx`, `containers/*/hooks/index.tsx` (`useListItem`) and classes named `*ViewModel` (`FamilyViewModel`). Closest to the target: `Family` (`useFamilies` + `index.tsx`). Write new code with this pattern. When you touch a legacy screen, migrate it: move the logic into `use<Name>ViewModel` and rename the classes to `*UIModel`.

## ViewModel hook

```ts
// screens/Financial/Accounts/hooks/useAccountsViewModel.ts
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect } from "react";

import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";

import AccountUIModel from "../models/AccountUIModel";

async function fetchAccounts() {
  const owners = await useCases.getOwnersUseCase.execute();
  const dtos = await useCases.getFinancialAccountsUseCase.execute(
    owners.map((owner) => owner.id),
  );
  return dtos.map((dto) => new AccountUIModel(dto, owners));
}

function useAccountsViewModel() {
  const isFocused = useIsFocused();
  const { data, error, isFetching, refetch } = useQuery<AccountUIModel[]>({
    cacheKey: [useCases.getFinancialAccountsUseCase.uniqueName],
    fetch: fetchAccounts,
  });

  useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  function onAddPress() {
    // `openModal` (useModalNavigation, spec 057) pushes `<current screen>/add_new_account`.
    openModal("add_new_account");
  }

  return {
    accounts: data ?? [],
    errorMessage: error?.message,
    isLoading: isFetching,
    onAddPress,
    refetch,
  };
}

export default useAccountsViewModel;
```

Rules:

- Name: `use<Name>ViewModel`, default export, re-exported from `hooks/index.ts`.
- Return a **flat object designed for the View**: UI models, booleans (`isLoading`, `isEditing`, `isEmpty`), handlers named `on<Event>` (`onAddPress`, `onDelete`, `onSave`), and translation keys when the text depends on state. Don't return raw `useQuery`/`useMutation` objects.
- Put the fetch function outside the hook (`async function fetchX()`), so it can be tested on its own.
- Data access only through `@infrastructure/fetcher`:
  - `useQuery({ cacheKey, fetch, enabled?, retry?, networkMode? })` → `{ data, error, isFetching, refetch, status }`
  - `useMutation({ cacheKey, fetch })` → `{ mutate, status, error, data, isFetching }`
  - `cacheKey` is `[useCases.X.uniqueName, ...]`.
- Side effects live here: react to `mutation.status === "success"` (`router.back()`, `props.refetch()`), refetch on focus, `navigation.setOptions` (header buttons such as `RefetchCache`).
- Container ViewModels receive the container's props: `useListItemViewModel(props: Props)`. Export `Props` from the hook file.
- **Imperative UI with no View** (`Alert.alert`, `window.confirm`, header titles set through `navigation.setOptions`) is the only case where the hook calls `useTranslation()` itself. Delete confirmation: `isWeb()` → `window.confirm`, otherwise `Alert.alert` with cancel/destructive buttons.

## View

```tsx
// screens/Financial/Accounts/index.tsx
function FinancialAccounts() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { accounts, errorMessage, isLoading, refetch } = useAccountsViewModel();

  function renderItem({ item }: { item: AccountUIModel }) {
    return <ListItem item={item} refetch={refetch} />;
  }

  if (isLoading) {
    return <Text.Title value={t("financial.accounts.loading")} />;
  }
  if (errorMessage) {
    return <Text.Headline value={errorMessage} />;
  }
  return (
    <FlashList data={accounts} estimatedItemSize={60} renderItem={renderItem} />
  );
}
```

- Only `useStyles()`, `useTranslation()`, `useTheme()` and its own ViewModel hook. Local render helpers like `renderItem` are fine.
- Branch order: loading → error → content.
- Lists use `FlashList` with `estimatedItemSize`. There is no FAB: add actions live in quick add (`/quick_add`) or in the screen.
- Shared UI comes only from `@components` (see `components.md`).

## UI Model (`models/<Name>UIModel.ts`)

```ts
import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { TranslationKeys } from "@presentation/i18n/types";

class AccountUIModel {
  get formattedBalance() {
    return new Intl.NumberFormat("en-US", {
      currency: "USD",
      style: "currency",
    }).format(this.dto.balance);
  }
  get id() {
    return this.dto.id;
  }
  get isArchived() {
    return this.dto.status === "ARCHIVED";
  }
  get name() {
    return this.dto.name;
  }
  get ownerName() {
    return this.owners.find((owner) => owner.id === this.dto.ownerId)?.name;
  }
  // keys must exist in en-US and pt-BR translations
  get ownerTypeLabelKey(): TranslationKeys {
    return this.dto.owner === "FAMILY"
      ? "financial.accounts.family"
      : "financial.accounts.personal";
  }

  constructor(
    private readonly dto: AccountDTO,
    private readonly owners: OwnerDTO[],
  ) {}
}

export default AccountUIModel;
```

- Name `<Thing>UIModel`. The `UI` prefix avoids clashing with data-layer models such as `AccountModel`.
- Getters only, in alphabetical order. Wraps DTOs, never entities.
- Formatting (currency, dates, percentages) and derived flags (`isArchived`, `isExpense`) live here, not in JSX or the hook.
- Text that depends on data is returned as a `TranslationKeys` value (`*LabelKey`) and translated in the View: `t(item.ownerTypeLabelKey)`.
- Picker/option models (`NewAccountUIModel.accountStatuses`) return `{ labelKey: TranslationKeys, value }`. The View maps them to `{ label: t(labelKey), value }`.

## Modal (`modals/NewXModal`)

`useNewXViewModel()`:

- Reads `useLocalSearchParams<{ id?: string; ... }>()` and sets `isEditing = !!params.id`.
- Owns `useForm({ initialValues })`. `validateForm` returns typed values or `undefined`, and stores errors as **translation keys**: `Partial<Record<Field, TranslationKeys>>`.
- Runs one `useMutation` that calls the create or update use case depending on `isEditing`. On success it calls `router.back()`.
- Returns `{ fields, errors, isEditing, isLoading, titleKey, submitLabelKey, options, onSave, onCancel }`.

The View renders the following and calls `t()` on every key:

- A backdrop: `<Pressable onPress={onCancel} style={styles.backdrop} />`.
- `<Card customStyles={styles.container}>` containing a `ScrollView` and a `Text.Headline` title.
- The inputs, separated by `<Spacer direction="vertical" size="medium" />`, each followed by `<HelperText type="error" visible={!!errors.x} label={errors.x ? t(errors.x) : ""} />`.
- A footer `Card` with `Button.Text` (cancel, in the error color) and `Button.Filled` (save/add).

A modal also needs a route file and a `Stack.Screen` entry (see `routing.md`).

## Composition with the kit

Screens compose kit components (`components.md`) and never style visual details themselves (no color literals, no Paper imports; lint-enforced outside the temporary migration allow-list). Forms and selects open in a `BottomSheet`. Large forms use `size="form"` + `FormColumns` (two columns on web/tablet, see `components.md`); screens never read the breakpoint for this layout (the one exception is the stock form's initial `isMoreOpen`). Legacy snippets above that mention `Button.Text`/`Button.Filled`/`Card customStyles` describe unmigrated screens; new code uses `Button.Secondary`/`Button.Primary` and `BottomSheet`.

## Testing (see `testing.md`)

- ViewModel hooks: `renderHook(() => useXViewModel(props))` from `@tests`. Mock `@application/useCases` and `@infrastructure/fetcher`. Assert the returned shape and that handlers call `mutate` or `router` correctly.
- UI models and `fetchX` functions: plain unit tests.
- Views: render tests only, with the ViewModel hook mocked (`jest.mock("./hooks")`). Cover the loading, error and content branches.

## Rules

- Never import `@tanstack/react-query` or `react-i18next` directly (lint-enforced).
- Components are `function X() {}` declarations (`func-style: declaration`) with a default export.

## Modal layout rule (owner, 2026-10-20)

Every new modal is flexible: on `medium`/`expanded` the larger two-column `BottomSheet size="form"` with `FormColumns` (Delete in `footerStart`), on `compact` the bottom sheet. Only confirmations and pickers stay `dialog` size. `NewTagModal` (spec 043) follows it.

## Filters on a list (spec 045)

The Transactions filters live in a module-level store (`useTransactionFilters`, `useSyncExternalStore`): they survive leaving the screen and reset on reload. While `isFiltering`, the view model runs the filtered queries (keyed by the normalized filter, previous result kept with `useKept`) over `period ?? month`, hides the daily balances and the month summary, and builds a `FilteredSummary`. The modal edits a draft and commits on "Apply filters".

## Finances overview (spec 046)

`screens/Financial/Overview` (route `/financial/overview`, first section of `FINANCIAL_SECTIONS`; entering Finances still opens Transactions). `useOverviewViewModel` owns the scope, period preset (3M/6M/12M/Year or a custom range through `CustomPeriodSheet`), currency (default = most accounts until the user picks one), granularity, type (drives the category and tag blocks), the subcategories view and one `useQuery` per block (summary, balance series, totals PERIOD / CATEGORY / TAG; keyed by the whole query and refetched when the screen regains focus). The filters are their own store (`useOverviewFilters`, not shared with Transactions) and reuse `FiltersModal` with `hidePeriod` plus `FilterToolbar` (own test ids). Blocks (`components/*Block`) compose the kit (`StatTile`, `ChartCard`, `LineChart`, `ColumnChart`, `BarList`); models in `models/` (`overviewPeriod`, `overviewFormat`, `barRows`, `drillThrough`, `blockState`). "See in Transactions" replaces the Transactions filters (`setTransactionFilters`) and leaves the scope and type in `Transactions/hooks/pendingNavigation`, which the Transactions view model takes when it gains focus. Deviations from the canvas: the balance detail is a panel under the chart on web too (no floating tooltip); granularity options the period does not allow are left out and their hint is shown as text.

## Optimistic updates (spec 061)

A change the user confirmed that should show at once goes through `Transactions/pending/runPendingChange`, not through a modal's `useMutation`: the request outlives the modal. Pattern: build a `PendingChange` (kind, description, row/previous/target), call `runPendingChange(change, execute, retry)`, then close the modal. The list ViewModel merges the pending changes into the loaded data with a pure function; the React Query cache is never edited, so refetches cannot drop or double a pending row. Failures are queued in the store and shown by the global `ErrorToastHost`.
