# Home Module Context

## Application

```yaml
use_cases:
  getMonthSummaryUseCase:
    path: src/application/useCases/cases/home/getMonthSummaryUseCase.ts
    uniqueName: home.get_month_summary_use_case
    params: "{ month: Date, ownerIds: string[] }"
    returns: MonthSummaryDTO # balance, income, expense, (spec 033) toPay / toReceive and (spec 034) projectedExpense / projectedIncome, zero for the current and past months (Home shows the current month)
    behavior: Sums income and expenses of the transactions inside the local calendar month of `month`; balance = income - expense (integer cents).
  getUpcomingItemsUseCase:
    path: src/application/useCases/cases/home/getUpcomingItemsUseCase.ts
    uniqueName: home.get_upcoming_items_use_case
    params: "{ ownerIds: string[] }"
    returns: UpcomingDTO # overdue (all), next (cut by the API to 5 of the next 7 days), nextTotal, overdueExpenseCents
    behavior: One call to GET /v1/finance/upcoming (spec 062): unpaid account rows, open card invoices (one item per card and month) and account recurrence projections, already split into overdue and next. Never cached.
  getStockAttentionUseCase:
    path: src/application/useCases/cases/home/getStockAttentionUseCase.ts
    uniqueName: home.get_stock_attention_use_case
    params: "{ ownerIds: string[], now?: Date }"
    returns: StockAttentionDTO
    behavior: Items expired or expiring within the shared domain rule (src/domain/entities/stock/stockExpiration.ts, 7 local calendar days, owned by spec 011), ordered by urgency, capped at 3; also returns attentionCount and totalItems.

dtos:
  - name: MonthSummaryDTO
    path: src/application/dto/home/MonthSummaryDTO.ts
  - name: StockAttentionDTO
    path: src/application/dto/home/StockAttentionDTO.ts
  - name: UpcomingDTO
    path: src/application/dto/home/UpcomingDTO.ts

rules:
  - Month is the local calendar month (day 1 to last day).
  - Caps: 3 attention items; the upcoming list shows every overdue item and at most 5 of the next 7 days (the API cuts them).
  - Pure balance rules live in src/domain/entities/home/balanceProjection.ts (projectedEndOfMonth, deriveBreakdown, lowestBalanceDay).
```

## Presentation

```yaml
screen:
  path: src/presentation/screens/Home/index.tsx
  testIds: src/presentation/screens/Home/testIds.ts (screen id `home.home.screen`, section ids `home.finance.section` / `home.stock.section`, used by E2E flows)
  layout: Screen (maxWidth 960, pull to refresh) with two sections, Finance then Stock (spec 062). Each section is two columns on the `expanded` breakpoint (Finance = balance card + lowest-balance card | upcoming card; Stock = summary card | attention list card), stacked otherwise.
  uses: ScreenHeader (with ProfileButton), ChipGroup (owner filter), Section, Skeleton, kit cards, ScrollBox (the upcoming list scrolls inside its card, 440 px on web / 320 px compact)

view_model:
  useHomeViewModel: src/presentation/screens/Home/hooks/useHomeViewModel.ts
  homeOwnerFilterStore: src/presentation/screens/Home/hooks/homeOwnerFilterStore.ts (session-only owner filter, survives tab switches, not persisted)
  notes: blocks balance (month summary + this month's daily balances + accounts), lowest (daily balances of this and next month), upcoming and stock load and fail on their own (`toBlock` / `combineBlocks`); the balances reuse `getFinancialDailyBalancesUseCase` (spec 035) and the accounts `getFinancialAccountsUseCase` (the current balance of the breakdown). Handlers open the Overview (`/financial/overview`), the transaction modal (a row, or a projection with `recurrenceId`/`occurrenceNumber`/`month`) and, for an invoice, the transactions screen filtered by that card (origin CARD) and the invoice's month through `setTransactionFilters`.

ui_models:
  - HomeHeaderUIModel
  - FinanceBalanceUIModel (projected end of month = last day total of the daily balances; breakdown always adds up)
  - LowestBalanceUIModel (this month from today, next month whole; ties pick the earliest day)
  - UpcomingUIModel / UpcomingRowUIModel (badges: overdue days, to receive, projected; an invoice is one row)
  - StockAttentionUIModel
  - ownerFilter (ALL / PERSONAL / one chip per family)
  path: src/presentation/screens/Home/models/

components:
  - FinanceBalanceCard
  - LowestBalanceTiles (web: hover tooltip with the balance by account through the kit `Tooltip` and `DayBalanceLine`; mobile: chevron expands the same lines)
  - UpcomingList (overdue group header with its expense total, "Next 7 days" group, empty "All set" state, invoice row with "See transactions")
  - StockSummaryCard (attention count and items in stock)
  - StockAttentionListCard (testIDs `home.stock-attention.*` in `Home/testIds.ts`; rows open `/stock?filter=EXPIRING`; E2E `stock/home-attention-card`, spec 021)
  path: src/presentation/screens/Home/components/

routes_opened:
  - /settings (profile button)
  - /financial/overview (Finance section link, balance card, lowest-balance tiles)
  - /financial/transaction (upcoming See all, an invoice row filtered by its card)
  - /add_new_transaction (modal over Home, spec 057; an upcoming row or projection, empty state)
  - /add_new_account (modal, from the lowest-balance tiles when the filter has no account)
  - /stock (See all, filter=EXPIRING)
  - /add_new_stock_item (modal over Home)
```

## Removed

```yaml
- The old stock dashboard container, view model, use case and DTO (replaced by getStockAttentionUseCase)
```

## E2E (spec 062)

Flows `financial/home/finance-section` (overdue + upcoming rows, projected balance, lowest-balance tile, section link to the Overview) and `finance-section-empty` ("All set" empty state and the create-account link), tags `financial`, `home`, `spec-062`. `financial/transactions/home-latest-transactions` was updated for the new list (an unpaid overdue row shows as `home.finance.upcomingItem-title`). New helper `e2e/scripts/upcoming-dates.js` (`OVERDUE_DATE` three days ago, `UPCOMING_DATE` two days ahead). Row ids: `home.finance.upcomingItem` (title `-title`), `home.finance.upcomingOverdueHeader`, `home.finance.upcomingInvoiceButton`, `home.finance.upcomingEmpty`, `home.finance.projectedBalance`, `home.finance.lowestCurrent|lowestNext|lowestDetail`, `home.finance.lowestToggle-<current|next>` (native chevron), section links `home.finance.section-action` / `home.stock.section-action`.

## Settings: app and API versions (spec 056)

- `src/presentation/screens/Config/containers/Versions` — footer pill below "Delete account": `App X · API Y · <Environment>` + status chip; opens the modal. The Login screen shows the same line as plain text (`Login/components/VersionLine`).
- `src/presentation/screens/Config/modals/Versions` — Versions modal (modal `versions`, URL `/settings/versions`, registry `src/navigation/modalRoutes.tsx`): two cards (app, API) and the "What changed" view (`components/ChangesList`), driven by `hooks/useVersionsViewModel`.
- `src/presentation/hooks/useVersionInfo` — shared hook: version query (start, foreground, every 30 min, stale 10 min), web `/version.json`, banner dismissal (`@version_banner_dismissed`); `labels.ts` maps status to chip keys.
- `src/presentation/screens/Navigation/containers/UpdateBanner` — banner slot at the top of the signed-in layout (`StatusBanner` from `@components`).
- Pure rules: `src/domain/entities/version/versionStatus.ts` (`resolveVersionStatus`, `newerReleases`, `isNewerVersion`).
