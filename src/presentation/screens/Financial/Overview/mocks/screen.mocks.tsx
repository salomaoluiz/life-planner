import { render } from "@tests";

import { useBreakpoint } from "@presentation/theme";

import { useOverviewViewModel } from "../hooks";
import FinancialOverview from "../index";

jest.mock("../hooks");
jest.mock("@screens/Financial/Transactions/hooks/useFilterOptions", () => ({
  __esModule: true,
  default: () => ({ categories: [], categoryDtos: [], sources: [], tags: [] }),
}));

function query(data: unknown, status = "success") {
  return {
    data,
    error: null,
    isFetching: false,
    refetch: jest.fn(),
    status,
  };
}

const period = {
  bucket: "MONTH",
  groupBy: "PERIOD",
  items: [
    {
      end: "2026-09-30",
      expense: { projected: 0, realized: 400 },
      income: { projected: 0, realized: 900 },
      start: "2026-09-01",
    },
  ],
};

const vmStub = {
  allOwnerIds: ["user-id"],
  archivedOwnerIds: new Set<string>(),
  balance: query({
    currency: "BRL",
    granularity: "MONTH",
    points: [
      {
        accounts: [{ balance: 5000, id: "a", name: "Checking" }],
        balance: 5000,
        end: "2026-09-30",
        projected: false,
        start: "2026-09-01",
      },
      {
        accounts: [{ balance: 6000, id: "a", name: "Checking" }],
        balance: 6000,
        end: "2026-10-31",
        projected: true,
        start: "2026-10-01",
      },
    ],
  }),
  categoryTotals: query({
    groupBy: "CATEGORY",
    items: [
      {
        archived: false,
        categoryId: "food",
        count: 2,
        hasChildren: false,
        name: "Food",
        projected: 0,
        realized: 300,
        self: false,
      },
    ],
    total: 300,
  }),
  currencies: [],
  currency: "BRL",
  customOpen: false,
  effectiveGranularity: "MONTH",
  filtersActive: false,
  filtersOpen: false,
  filterStore: {
    clearAll: jest.fn(),
    filters: {
      accountIds: [],
      cardIds: [],
      categoryIds: [],
      search: "",
      tagIds: [],
    },
    removeGroup: jest.fn(),
    replace: jest.fn(),
    setSearch: jest.fn(),
  },
  granularityOptions: [
    { enabled: false, hintKey: "day", value: "DAY" },
    { enabled: true, value: "WEEK" },
    { enabled: true, value: "MONTH" },
  ],
  noTransactions: false,
  onApplyCustomPeriod: jest.fn(),
  onBack: jest.fn(),
  onCategoryPress: jest.fn(),
  onCurrencyChange: jest.fn(),
  onCustomClose: jest.fn(),
  onFiltersClose: jest.fn(),
  onFiltersOpen: jest.fn(),
  onGranularityChange: jest.fn(),
  onNewTransaction: jest.fn(),
  onOpenParentTransactions: jest.fn(),
  onOwnerFilterChange: jest.fn(),
  onPresetChange: jest.fn(),
  onTagPress: jest.fn(),
  onTypeChange: jest.fn(),
  ownerChoices: [{ label: "financial.common.all", value: "ALL" }],
  ownerFilter: "ALL",
  ownerIds: ["user-id"],
  period: { from: "2025-11-01", to: "2026-10-31" },
  periodTotals: query(period),
  preset: "12M",
  selectedGroup: undefined,
  selectedPoint: undefined,
  setSelectedGroup: jest.fn(),
  setSelectedPoint: jest.fn(),
  summary: query({
    balance: { current: 6000, previous: 5000, projectedEnd: null },
    currencies: [],
    currency: "BRL",
    expense: { previous: 200, projected: 0, realized: 400 },
    income: { previous: 0, projected: 0, realized: 900 },
  }),
  tagTotals: query({
    groupBy: "TAG",
    items: [
      { count: 1, name: "fixed", projected: 0, realized: 200, tagId: "t1" },
    ],
    total: 300,
    untagged: { count: 1, projected: 0, realized: 100 },
  }),
  today: "2026-10-20",
  type: "EXPENSE",
};

function setup(
  overrides: Record<string, unknown> = {},
  breakpoint = "expanded",
) {
  jest.mocked(useBreakpoint).mockReturnValue(breakpoint as never);
  jest
    .mocked(useOverviewViewModel)
    .mockReturnValue({ ...vmStub, ...overrides } as never);
  render(<FinancialOverview />);
}

export { query, setup, vmStub };
