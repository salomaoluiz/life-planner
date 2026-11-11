# Investment Module Context (spec 102, quotes: spec 104)

> Born on the NestJS API (no Supabase). Screens and modals render through `AdaptiveLayout` (spec 099): each folder has an `index.tsx` entry (calls the ViewModel once) and `views/Wide.tsx` (the View, which reads `useDensity()` for the compact cards). Money is integer cents in the asset currency; quantities and unit prices are decimal strings (up to 8 places), handled with `@utils/decimal` (scaled `bigint`), never floats.

## Domain

```yaml
entities:
  InvestmentEntities:
    path: src/domain/entities/investment/InvestmentEntities.ts
    notes: plain interfaces (InvestmentAsset, InvestmentAssetDetail, InvestmentOperation, InvestmentFee, InvestmentPosition, InvestmentValuation, *Result)
  enums:
    path: src/domain/entities/investment/enums.ts
    notes: InvestmentAssetClass, AssetStatus, FeeKind, OperationType, ValuationSource, ASSET_CLASS_ORDER, TICKER_REQUIRED_CLASSES, MAX_FEES_PER_OPERATION
  position:
    path: src/domain/entities/investment/position.ts
    notes: port of the API's PositionCalculator for the form preview (computeTotals, previewOperation); the API result is the source of truth after saving

errors: src/domain/entities/errors/investment/ (TickerExists, InvestmentArchived, InvestmentClassLocked, InvestmentFeesAboveSale, InvestmentNegativePosition(date), InvestmentAccountNotChangeable, InvestmentRowUseOperation)

interfaces:
  InvestmentRepository:
    path: src/domain/repositories/investment/investmentRepository.ts
    methods:
      [
        createAsset,
        createOperation,
        deleteAsset,
        deleteOperation,
        deleteValuation,
        getAsset,
        getAssets,
        getOperationLink,
        updateAsset,
        updateOperation,
        upsertValuation,
      ]
```

## Application

```yaml
use_cases: src/application/useCases/cases/investment/*UseCase.ts (createInvestmentAsset, createInvestmentOperation, deleteInvestmentAsset, deleteInvestmentOperation, deleteInvestmentValuation, getInvestmentAsset, getInvestmentAssets, getInvestmentOperationLink, updateInvestmentAsset, updateInvestmentOperation, upsertInvestmentValuation) — pass-through with addContext; they return domain entities (no DTO layer)
query_keys: src/application/queryKeys/investmentKeys.ts (investment, investment/assets/<status>, investment/asset/<id>)
```

## Infrastructure

```yaml
repository: src/data/repositories/repos/investment/investmentRepositoryImpl.ts (no cache: React Query caches the reads)
datasource (NestJS API): src/data/datasource/data/investment/api/index.ts
  errors: investmentApiError.ts (409 ticker, 422 messages -> domain errors, negative-position date parsed from the message, 403 "account you can't change")
  endpoints: GET/POST /v1/investments/assets, GET/PATCH/DELETE /v1/investments/assets/:id, POST /v1/investments/assets/:id/operations, PATCH/DELETE /v1/investments/operations/:id, PUT /v1/investments/assets/:id/valuations/:date, DELETE /v1/investments/valuations/:id, GET /v1/finance/transactions/:id (getOperationLink reads `investment`)
  validation: quantities/prices are normalized ("10,5" -> "10.5") and must be > 0 BEFORE the call (FieldInvalid)
model: src/data/models/investment/InvestmentModel.ts (API shape, no toJSON)
```

## Presentation

```yaml
routes: app/(app)/(tabs)/investments/{_layout,index,asset/[id]}.tsx (tab "investments" after Finances; the Stack lives in Investment/Layout)
screens:
  List: src/presentation/screens/Investment/List (owner chips via the finance owner filter, All/Archived SegmentedControl with counts, search by ticker/name, rows grouped by class AND currency with "Cost · Current" subtotal, table row on regular width, card on compact, footnote; states skeleton/error/empty/no results; archived family = read-only)
  Detail: src/presentation/screens/Investment/Detail (6 summary cards, operations list -> operation modal, value history with delete, "More actions" sheet: edit / archive-reactivate / delete with a ConfirmDialog that lists operations and finance entries, archived banner with Reactivate; `?operation=<id>` opens that operation once)
modals (MODAL_ROUTES names):
  investment_asset: Modals/AssetModal (class SelectField, ticker upper-cased and filling the name, owner chips, currency (USD suggested for foreign stock, locked after the first operation), optional first value)
  investment_operation: Modals/OperationModal (Buy/Sell, date, quantity, price, up to 10 fees (kind, amount, description for Other), summary, "Generate finance entry" switch + account SelectField (active, asset currency, writable owner, BROKERAGE first), preview: new average price / realized result; sell above the held quantity blocks saving; read-only when the linked account is not reachable)
  investment_valuation: Modals/ValuationModal (date + value per unit, "Position: q x price = value")
helpers: Investment/models/{assetList,format}.ts, Investment/utils/investmentErrorMessage.ts, Investment/hooks/invalidateInvestments.ts (invalidates investment queries AND finance data)
testIds: src/presentation/screens/Investment/testIds.ts (investment.list.*, investment.detail.*, investment.asset-modal.*, investment.operation-modal.*, investment.valuation-modal.*)
finance_integration: Financial/Transactions rows of INVESTMENT_CONTRIBUTION / INVESTMENT_REDEMPTION ("Compra ITSA4", category translated from the key, "outside totals" caption) open the operation (`onInvestmentPress` -> getInvestmentOperationLinkUseCase -> /investments/asset/<assetId>?operation=<id>); they are never edited as transactions
```

## Design deviations (spec 102)

- One View per screen that adapts through `useDensity()`; the artboard's mobile "fees collapsed into one line with Edit" is not built: the fee list stays expanded on compact.
- The fee breakdown panel of the detail artboard is not a separate panel: tapping an operation opens the operation modal, which lists its fees.
- The archive banner and the list use the app's own components (SegmentedControl for the Assets/Archived tabs).

## Automatic quotes (spec 104)

```yaml
entities: InvestmentAsset gains quote (InvestmentQuote), priceSource (QUOTE|MANUAL), fx (rate of the day, USD assets), averageFxRate, brl (InvestmentBrlResult: cost, marketValue, result, resultFromAsset, resultFromFx, resultPercent) and operationsWithoutFxRate; InvestmentOperation.fxRate; new InvestmentPriceHistory/InvestmentPricePoint, InvestmentQuotesRefresh, InvestmentTickerSuggestion; enums InvestmentPriceKind, InvestmentPriceRange, InvestmentPriceSource, InvestmentQuoteMarket and QUOTED_CLASS_MARKET
errors: TickerNotFound (422 TICKER_NOT_FOUND), QuoteSourceUnavailable (503 QUOTE_SOURCE_UNAVAILABLE), QuoteRefreshTooSoon(retryAfterSeconds) (429 REFRESH_TOO_SOON); mapped in investmentApiError.ts from the `code` of the body
repository/use cases: searchTickers, refreshQuotes, getPriceHistory (searchInvestmentTickersUseCase, refreshInvestmentQuotesUseCase, getInvestmentPriceHistoryUseCase); query keys investmentKeys.priceHistory / tickerSearch
datasource: GET /v1/investments/tickers/search?market=&q=, POST /v1/investments/quotes/refresh { assetIds? }, GET /v1/investments/assets/:id/price-history?range=; operations send fxRate ("5,2236" -> "5.2236"; undefined = the API defaults it, null/"" = none)
list: columns Asset, Quantity, Price, Today, Current value (BRL below for USD), Result (BRL for USD), Updated (models/quoteInfo.ts: time / yesterday / date / manual, warning color when stale or manual over a quote); header "Quotes from 13:00 · updated every hour" + "Refresh now" (hooks/useQuoteRefresh.ts: 1 per minute, countdown from nextRefreshAt or the 429, source-down banner)
detail: price block, "Today's quote" panel, ChartPanel (LineChart over detail/models/priceChart.ts: price or "Position in BRL" for USD, ranges 1M/6M/1Y/All, points before the first close dashed), BRL result card + average rate, "Enter manual value" / "Back to automatic quote" (deletes the newest manual value)
asset modal: TickerAutocomplete (@components, over AutocompleteField, 300 ms debounce, 10 results) for quoted classes; a ticker typed but not picked blocks saving ("No asset found for ..."); the market sets the currency (read-only); quote box with the picked price
operation modal: "Exchange rate (BRL per USD)" for non-BRL assets, placeholder = the current rate
```

Design deviations (spec 104): the purchase markers of the chart are not drawn (the shared `LineChart` has no markers; the dashed segment and the legend carry the history start); the "fee breakdown" panel of spec 102 is unchanged; the asset list drops the Cost, Average price and Realized columns (they stay on the detail) to fit Price, Today and Updated.

## Fixed income calculated (spec 105)

```yaml
entities: InvestmentAsset.fixedIncome (InvestmentFixedIncome: product, taxExempt, maturityDate, liquidity, liquidityDate, currentEffectiveRate, maturityPending, today {gross, iof, ir, net}; the detail adds rates, adjustments, lots, atMaturity), InvestmentOperation.netAmount/redemptionKind; results InvestmentFixedIncomeWriteResult, InvestmentFixedIncomeAdjustmentResult, InvestmentFixedIncomeRedemptionPreview, InvestmentFixedIncomeSimulation; enums InvestmentFixedIncomeProduct/Liquidity/RateMode/RedemptionKind, InvestmentFeeKind.INCOME_TAX/IOF, TAX_EXEMPT_PRODUCTS
errors: InvestmentRedemptionTooLarge(availableNet | date) (422 with details), InvestmentUseFixedIncomeActions (422)
repository/use cases: createFixedIncomeTitle/Rate/Contribution/Redemption, upsertFixedIncomeTerms/Adjustment, updateFixedIncomeRate, deleteFixedIncomeRate/Adjustment, simulateFixedIncome, previewFixedIncomeRedemption (use cases createInvestmentFixedIncome*UseCase and friends, one per method); the datasource lives in data/datasource/data/investment/api/fixedIncomeApi.ts (percentages "14,90" -> "14.9", the mode decides which rate fields go)
query keys: investmentKeys.fixedIncomePreview / fixedIncomeSimulation
```

```yaml
presentation:
  models: Investment/FixedIncome/models/fixedIncome.ts (defaultTaxExempt, rate form + previewEffectiveRate, rateSummary/rateEntry, chipsOf, liquidityWarningOf, lotTaxesKey); hooks useEligibleAccounts (active BRL accounts of a writable owner, brokerage first), useDebouncedValue (400 ms); components RateFields (mode control + fields + effective rate)
  new title: AssetModal "Calculate from the rate" switch (new FIXED_INCOME asset, on by default) -> replaceModal investment_fixed_income -> Modals/FixedIncomeTitleModal (product, owner, name, tax exempt, amount, date, account, maturity, liquidity (+ grace date), rate, estimate at maturity from simulate)
  detail: Detail/components/FixedIncomeSection (rate line, five cards, pending banner, tabs Lots/Rates/Operations with edit/delete, "At maturity" panel; the header shows the four actions, Redeem + "More actions" on compact); the manual price/quote/valuation sections are not rendered for a calculated title
  modals (MODAL_ROUTES): investment_fixed_income, investment_fixed_income_contribution, investment_fixed_income_redeem (partial/total, liquidity warning, debounced preview, opens as TOTAL on the maturity date from the pending card), investment_fixed_income_rate (update, or edit with rateId), investment_fixed_income_adjust (compares with the gross of today)
  list: PendingMaturityCard first (confirm redemption), maturity + liquidity chips on the rows (grace period in the warning tone)
testIds: investment.fixed-income-modal.*, investment.redeem-modal.*, investment.contribution-modal.*, investment.rate-modal.*, investment.adjust-modal.*, investment.detail.fi-*, investment.list.pending-*
e2e: e2e/flows/investment/fixed-income-calculated.yaml, fixed-income-pending-maturity.yaml (spec-105)
```

Design deviations (spec 105): the adjust modal compares the statement with the app only for today (the detail has no curve for other dates; the API returns `computedGross` after saving); the operations tab of a calculated title lists contributions and redemptions read-only with delete (editing goes through new actions); the estimate of the rate in the forms is a client preview, the API derives and stores the real effective rate.

## Investment income (spec 107)

```yaml
entities: InvestmentIncome (netAmount cents, quantity/amountPerUnit decimal strings, status PLANNED|RECEIVED, overdue, estimatedGross/Withheld, withholdingRate), InvestmentIncomeDefaults, InvestmentIncomePage (+ summary), InvestmentIncomeSuggestion (canApproveDirectly, estimatedNet), InvestmentIncomeLink; enums InvestmentIncomeType/InvestmentIncomeStatus, defaultIncomeType(class) and incomeWithholdingBps(type, class) in domain/entities/investment/enums.ts (display only, the API is the source of truth)
errors: InvestmentCurrencyMismatch (422 CURRENCY_MISMATCH), InvestmentIncomeIncomplete(missing) (422 INCOME_INCOMPLETE), InvestmentIncomeLocked (422 EXTERNALLY_LOCKED), InvestmentIncomeReceived (409 ALREADY_RECEIVED); mapped in investmentApiError.ts from the `code` of the body
repository/use cases: createIncome, updateIncome, receiveIncome, deleteIncome, getIncome, getIncomes (keyset page), getIncomeDefaults, getIncomeLink, getIncomeSuggestions, approveIncomeSuggestion, rejectIncomeSuggestion (use cases createInvestmentIncomeUseCase ... rejectInvestmentIncomeSuggestionUseCase); income writes also drop the finance caches
datasource: data/datasource/data/investment/api/incomeApi.ts (spread into investmentApi): POST|GET|PATCH|DELETE /v1/investments/incomes, POST .../:id/receive, GET /v1/investments/assets/:id/income-defaults, GET /v1/investments/income-suggestions, POST .../:id/approve|reject; decimals normalized ("0,47" -> "0.47") and above zero BEFORE the call; undefined leaves a field out, null clears it
detail: Detail/components/IncomeSection (own view model Detail/hooks/useIncomeSectionViewModel): pending suggestion cards on top, received-this-year and planned tiles, All/Planned/Received filter, rows with status badge (Planned, Overdue in warning, Received in income colors), check button on planned rows, "+ Add income" action
modals (MODAL_ROUTES): investment_income (Modals/IncomeModal: create `assetId`, edit `id`, approve-with-edit `suggestionId`; BottomSheet size "form" with FormColumns = two columns on web/tablet, one stack on mobile; net amount follows quantity x per unit until typed, estimate card for JCP / US dividend, account and category defaults with the "asset default" / "last used" hints), investment_income_receive (Modals/IncomeReceiveModal: planned value, net received, received on, account, gross estimate; Confirm and Delete income)
inbox: app/(app)/(tabs)/investments/suggestions.tsx -> Investment/Suggestions (SuggestionCard shared with the detail, empty state); the list screen shows a "Suggestions" card with the count (List/components/SuggestionsCard, one extra request: budget investment.list.mount.cold 3 -> 4)
finance_integration: Financial/Transactions rows with `externalLock: "INVESTMENT"` (TransactionUIModel.isInvestmentIncome) show the "Income" tag, never the regular pay button, open the income modal on press (onIncomePress -> getInvestmentIncomeLinkUseCase) and the receive modal from their check (onIncomeReceive)
testIds: investment.income.*, investment.income-modal.*, investment.income-receive-modal.*, investment.suggestions.*, investment.list.suggestions-card, financial.transactions.row.income-tag
e2e: e2e/flows/investment/income-manual-received.yaml, income-confirm-from-transactions.yaml, suggestions-inbox-empty.yaml (spec-107; approving a suggestion needs provider events in the database, so it is covered by the unit tests)
```

Design deviations (spec 107): the detail lists the first 50 incomes (no "load more" yet; the API pages by keyset); the web modal uses the app's `form` sheet, whose width follows `formDialogMaxWidth` (880 px).
