# Home Module Context

> Screens and modals render through `AdaptiveLayout` (spec 100): each folder has an `index.tsx` entry (calls the ViewModel once) and `views/Wide.tsx` (the View). View paths below point to `views/Wide.tsx`.

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
  path: src/presentation/screens/Home/views/Wide.tsx
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

## Investments section (spec 109)

```yaml
use_case: getInvestmentsSummaryUseCase (src/application/useCases/cases/home, uniqueName home.get_investments_summary_use_case, params { ownerIds, today }) -> InvestmentsHomeSummary (BRL cents), one call to GET /v1/investments/summary through investmentRepository.getHomeSummary (datasource investment/api/summaryApi.ts, model InvestmentModel.toHomeSummary); query key investmentKeys.homeSummary(ownersKey)
view_model: useHomeViewModel adds `investments` (own BlockState, refetched on pull to refresh and, when stale, on focus through [...investmentKeys.all(), "home-summary"], so every investment write refreshes it), `canAddInvestmentAsset` (false for an archived-family filter) and the handlers onInvestmentsPress (/investments), onInvestmentsSuggestionsPress (/investments/suggestions), onInvestmentsMaturityPress(assetId) (/investments/asset/<id>), onInvestmentsAddAssetPress (modal investment_asset)
ui_model: models/InvestmentsSummaryUIModel (result tone and signed percentage from basis points, quotes footer `when` kind today|yesterday|date, income month, maturity date label and days left)
components: components/InvestmentsSection (index decides loading / error / empty / two cards on `expanded` / one compact card; PortfolioBlock = value, cost MetricBlock, result HighlightRow, footer or amber Highlight; IncomeBlock = income, suggestions link, maturity ListItem)
testIds: home.investments.{section,currentValue,invested,result,quotesFooter,income,suggestions,nextMaturity,empty,empty-action (the Add asset button),loading,error}
e2e: flows/financial/home/investments-section and investments-section-empty (tags financial, home, investment, spec-109); the result tile is asserted by its label (an accessible row does not expose its testID on web)
perf: home.home.mount.cold maxRequests 9 -> 10 (the new summary request); tests/perf/respond.ts answers /v1/investments/summary
```

Design deviations (spec 109): the result tile sits under the cost tile (full width) instead of beside it, the section title has no icon, and the maturity row has no chevron (kit components only; screens do not style visual details).

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

## Favorite account (spec 094)

- Currency (spec 103): `useHomeViewModel` reads the accounts first and `useScreenCurrency` (Financial/hooks) gives `vm.currency = { value, options, visible, onChange }`; the summary and daily-balance queries carry the currency in their keys and `getMonthSummaryUseCase` takes `currency` (rows read with `{ currency }`, no card invoices outside BRL, projections cut by currency); `FinanceBalanceCard` and `LowestBalanceTiles` take `currency`. A small `SelectField` (`hideLabel`, 96 wide, codes only, `home.finance.currency`) sits left of the Overview link through `Section.actionLeading`; "Upcoming" keeps every item, each in its own currency.
- `useHomeViewModel` resolves the favorite with `resolveFavoriteAccount` over the accounts the balances cover and passes it to `FinanceBalanceUIModel` (6th argument) and `LowestBalanceUIModel` (`{ id, name }`).
- `getMonthSummaryUseCase` returns `MonthSummaryDTO.byAccount` (income, expense, toPay, toReceive per account id: account rows plus the invoices already paid from the account), computed from the data it already reads: no new request.
- With a favorite the balance card shows a `Badge` (star + name, `home.finance.favoriteBadge`), the favorite's balance on the last day of the month as the projected end, a breakdown derived so it adds up to that end (`deriveBreakdown`), its income and expenses (expenses include the invoices the daily balances say it still pays), and a muted "Total of accounts" line (`home.finance.totalOfAccounts`, the 062 number). The lowest-balance tiles follow the favorite's daily balance ("Lowest balance day · name"); the detail lists it first (highlighted) and ends with the total of the filter on that day (`LowestBalanceTile.filterTotalCents`). The Upcoming list does not change.
- Without a favorite everything is as in spec 062.
