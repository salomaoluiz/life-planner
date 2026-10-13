# Home Module Context

## Application

```yaml
use_cases:
  getMonthSummaryUseCase:
    path: src/application/useCases/cases/home/getMonthSummaryUseCase.ts
    uniqueName: home.get_month_summary_use_case
    params: "{ month: Date, ownerIds: string[] }"
    returns: MonthSummaryDTO
    behavior: Sums income and expenses of the transactions inside the local calendar month of `month`; balance = income - expense (integer cents).
  getRecentTransactionsUseCase:
    path: src/application/useCases/cases/home/getRecentTransactionsUseCase.ts
    uniqueName: home.get_recent_transactions_use_case
    params: "{ ownerIds: string[], limit?: number }"
    returns: RecentTransactionDTO[]
    behavior: Newest first, capped at 5 by default, enriched with category name, icon and color; value in positive integer cents (sign comes from `type`).
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
  - name: RecentTransactionDTO
    path: src/application/dto/home/RecentTransactionDTO.ts

rules:
  - Month is the local calendar month (day 1 to last day).
  - Caps: 3 attention items, 5 recent transactions.
```

## Presentation

```yaml
screen:
  path: src/presentation/screens/Home/index.tsx
  layout: Screen (maxWidth 960, pull to refresh); two columns (summary + stock) on the `expanded` breakpoint, stacked otherwise.
  uses: ScreenHeader (with ProfileButton), ChipGroup (owner filter), Skeleton, kit cards

view_model:
  useHomeViewModel: src/presentation/screens/Home/hooks/useHomeViewModel.ts
  homeOwnerFilterStore: src/presentation/screens/Home/hooks/homeOwnerFilterStore.ts (session-only owner filter, survives tab switches, not persisted)
  notes: one query per block, so loading/error/retry are independent.

ui_models:
  - HomeHeaderUIModel
  - MonthSummaryUIModel
  - StockAttentionUIModel
  - RecentTransactionUIModel
  - ownerFilter (ALL / PERSONAL / one chip per family)
  path: src/presentation/screens/Home/models/

components:
  - MonthSummaryCard
  - StockAttentionCard
  - LatestTransactions
  path: src/presentation/screens/Home/components/

routes_opened:
  - /settings (profile button)
  - /financial (summary, transactions See all)
  - /financial/transaction/add_new_transaction
  - /stock (See all, filter=EXPIRING)
  - /stock/add_new_stock_item
```

## Removed

```yaml
- The old stock dashboard container, view model, use case and DTO (replaced by getStockAttentionUseCase)
```
