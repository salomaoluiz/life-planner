import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";

import { act, renderHook } from "@tests";
import queryName from "@tests/queryName";

import AccountDTO from "@application/dto/financial/AccountDTO";
import DailyBalanceDTO from "@application/dto/financial/DailyBalanceDTO";
import MonthSummaryDTO from "@application/dto/home/MonthSummaryDTO";
import StockAttentionDTO from "@application/dto/home/StockAttentionDTO";
import UpcomingDTO from "@application/dto/home/UpcomingDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import UserDTO from "@application/dto/user/UserDTO";
import { useCases } from "@application/useCases";
import { InvestmentsHomeSummary } from "@domain/entities/investment/InvestmentEntities";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { refetchStaleFetcherData, useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import { useBreakpoint } from "@presentation/theme";
import { setTransactionFilters } from "@screens/Financial/Transactions/hooks/useTransactionFilters";

import { resetHomeOwnerFilter } from "../homeOwnerFilterStore";
import useHomeViewModel from "../useHomeViewModel";

jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/theme", () => ({ useBreakpoint: jest.fn() }));
jest.mock(
  "@screens/Financial/Transactions/hooks/useTransactionFilters",
  () => ({ setTransactionFilters: jest.fn() }),
);
jest.mock("@application/useCases", () => ({
  useCases: {
    getFinancialAccountsUseCase: { execute: jest.fn(), uniqueName: "accounts" },
    getFinancialDailyBalancesUseCase: {
      execute: jest.fn(),
      uniqueName: "balances",
    },
    getInvestmentsSummaryUseCase: {
      execute: jest.fn(),
      uniqueName: "investments",
    },
    getMonthSummaryUseCase: { execute: jest.fn(), uniqueName: "summary" },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "owners" },
    getStockAttentionUseCase: { execute: jest.fn(), uniqueName: "stock" },
    getUpcomingItemsUseCase: { execute: jest.fn(), uniqueName: "upcoming" },
    getUserUseCase: { execute: jest.fn(), uniqueName: "user" },
  },
}));

// region mocks

const family = new OwnerDTO({
  id: "family-1",
  name: "Silva",
  type: OwnerType.FAMILY,
});
const person = new OwnerDTO({
  id: "user-id",
  name: "Test User",
  type: OwnerType.USER,
});
const owners = [family, person];
const user = new UserDTO({
  email: "test@example.com",
  id: "user-id",
  name: "Ana Souza",
});
const summary = new MonthSummaryDTO({
  balance: 100,
  expense: 50,
  income: 150,
  toPay: 0,
  toReceive: 0,
});
const stock = new StockAttentionDTO({
  attentionCount: 0,
  items: [],
  totalItems: 2,
});
const accounts = [
  new AccountDTO({
    balance: 1000,
    icon: "bank",
    id: "account-1",
    name: "Checking",
    owner: "USER",
    ownerId: "user-id",
    status: "ACTIVE",
  }),
];
const balances = new DailyBalanceDTO({
  accounts: [
    {
      icon: "bank",
      id: "account-1",
      name: "Checking",
      owner: OwnerType.USER,
      ownerId: "user-id",
    },
  ],
  days: [
    {
      accounts: [{ accountId: "account-1", balanceCents: 80000 }],
      cardsDueCents: 0,
      date: "2026-10-31",
      projected: true,
      totalCents: 80000,
    },
  ],
  month: "2026-10",
});
const upcoming = new UpcomingDTO({
  next: [],
  nextTotal: 0,
  overdue: [
    {
      accountId: "account-1",
      categoryId: "category-1",
      creditCardId: null,
      currency: "BRL",
      date: "2026-10-03",
      description: "Rent",
      id: "t1",
      invoiceMonth: null,
      kind: "TRANSACTION",
      occurrenceNumber: null,
      owner: "USER",
      ownerId: "user-id",
      purchaseCount: null,
      recurrenceId: null,
      type: "EXPENSE",
      valueCents: 240000,
    },
  ],
  overdueExpenseCents: 240000,
});

const investment: InvestmentsHomeSummary = {
  currentValueCents: 18432055,
  hasPositions: true,
  income: {
    count: 6,
    month: "2026-10",
    pendingSuggestions: 2,
    totalCents: 128430,
  },
  investedCents: 16290000,
  quotes: { manualCount: 0, stale: false, withoutPrice: 0 },
  resultBasisPoints: 1315,
  resultCents: 2142055,
};

const mocks = {
  accounts,
  balances,
  family,
  investment,
  owners,
  person,
  stock,
  summary,
  upcoming,
  user,
};

const queries = {
  accounts: new UseQueryFixture<AccountDTO[]>(),
  balances: new UseQueryFixture<DailyBalanceDTO>(),
  investment: new UseQueryFixture<InvestmentsHomeSummary>(),
  owners: new UseQueryFixture<OwnerDTO[]>(),
  stock: new UseQueryFixture<StockAttentionDTO>(),
  summary: new UseQueryFixture<MonthSummaryDTO>(),
  upcoming: new UseQueryFixture<UpcomingDTO>(),
  user: new UseQueryFixture<UserDTO>(),
};

// endregion mocks

// region spies

const spies = {
  getAccounts: jest.mocked(useCases.getFinancialAccountsUseCase.execute),
  getBalances: jest.mocked(useCases.getFinancialDailyBalancesUseCase.execute),
  getInvestments: jest.mocked(useCases.getInvestmentsSummaryUseCase.execute),
  getMonthSummary: jest.mocked(useCases.getMonthSummaryUseCase.execute),
  getStockAttention: jest.mocked(useCases.getStockAttentionUseCase.execute),
  getUpcoming: jest.mocked(useCases.getUpcomingItemsUseCase.execute),
  isFocused: jest.mocked(useIsFocused),
  push: jest.mocked(router.push),
  refetchStale: jest.mocked(refetchStaleFetcherData),
  setTransactionFilters: jest.mocked(setTransactionFilters),
  useBreakpoint: jest.mocked(useBreakpoint),
  useQuery: jest.mocked(useQuery),
};

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  // Only the clock is fixed (October 2026, the month of the balances above): timers stay real for the awaits.
  jest.useFakeTimers({
    doNotFake: [
      "cancelAnimationFrame",
      "cancelIdleCallback",
      "clearImmediate",
      "clearInterval",
      "clearTimeout",
      "hrtime",
      "nextTick",
      "performance",
      "queueMicrotask",
      "requestAnimationFrame",
      "requestIdleCallback",
      "setImmediate",
      "setInterval",
      "setTimeout",
    ],
    now: new Date(2026, 9, 15, 10),
  });
  resetHomeOwnerFilter();
  Object.values(queries).forEach((query) => query.reset());
  spies.isFocused.mockReturnValue(false);
  spies.useBreakpoint.mockReturnValue("compact");
});

afterEach(() => {
  jest.useRealTimers();
});

type QueryName = keyof typeof queries;

// The daily balances fixture is called `balances` here.
function fixtureName(cacheKey: string[]) {
  const name = queryName(cacheKey);

  return name === "dailyBalances" ? "balances" : name;
}

// The options each query was created with (cacheKey, enabled, fetch).
function optionsOf(name: QueryName) {
  const calls = spies.useQuery.mock.calls.filter(
    ([options]) => fixtureName(options.cacheKey) === name,
  );

  return calls[calls.length - 1][0];
}

// Routes each useQuery call to its fixture through the use case uniqueName in the cache key.
function setup(data: Partial<Record<QueryName, unknown>> = {}) {
  (Object.keys(data) as QueryName[]).forEach((name) => {
    (queries[name] as UseQueryFixture<unknown>).withData(data[name]);
  });

  spies.useQuery.mockImplementation(((options: { cacheKey: string[] }) =>
    queries[fixtureName(options.cacheKey) as QueryName].build()) as never);

  return renderHook(() => useHomeViewModel());
}

const loaded = {
  accounts,
  balances,
  investment,
  owners,
  stock,
  summary,
  upcoming,
  user,
};

export { act, loaded, mocks, optionsOf, queries, setup, spies };
