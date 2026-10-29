const overviewTestIds = {
  balanceChart: "financial.overview.balance-chart",
  balanceDetail: "financial.overview.balance-detail",
  balanceProjectedEnd: "financial.overview.tile-balance-projected-end",
  blockError: (block: string) => `financial.overview.block-error-${block}`,
  categories: "financial.overview.categories",
  categoriesBack: "financial.overview.categories-back",
  categoriesOpenTransactions: "financial.overview.categories-open-transactions",
  categoriesType: (type: string) =>
    `financial.overview.categories-type-${type}`,
  category: (id: string) => `financial.overview.category-${id}`,
  currency: "financial.overview.currency",
  currencyOption: (code: string) =>
    `financial.overview.currency-option-${code}`,
  empty: "financial.overview.empty",
  emptyClear: "financial.overview.empty-clear",
  emptyNew: "financial.overview.empty-new",
  filtersButton: "financial.overview.filters-button",
  granularity: (value: string) => `financial.overview.granularity-${value}`,
  incomeExpenseChart: "financial.overview.income-expense-chart",
  incomeExpenseDetail: "financial.overview.income-expense-detail",
  period: (preset: string) => `financial.overview.period-${preset}`,
  retry: (block: string) => `financial.overview.retry-${block}`,
  scope: (id: string) => `financial.overview.scope-${id}`,
  screen: "financial.overview.screen",
  search: "financial.overview.search",
  tag: (id: string) => `financial.overview.tag-${id}`,
  tags: "financial.overview.tags",
  tile: (name: string) => `financial.overview.tile-${name}`,
} as const;

export default overviewTestIds;
