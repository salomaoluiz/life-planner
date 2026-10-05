import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";

import { act, renderHook } from "@tests";

import MonthSummaryDTO from "@application/dto/home/MonthSummaryDTO";
import RecentTransactionDTO from "@application/dto/home/RecentTransactionDTO";
import StockAttentionDTO from "@application/dto/home/StockAttentionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import UserDTO from "@application/dto/user/UserDTO";
import { useCases } from "@application/useCases";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import { useBreakpoint } from "@presentation/theme";

import { resetHomeOwnerFilter } from "../homeOwnerFilterStore";
import useHomeViewModel from "../useHomeViewModel";

jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/theme", () => ({ useBreakpoint: jest.fn() }));
jest.mock("@application/useCases", () => ({
  useCases: {
    getMonthSummaryUseCase: { execute: jest.fn(), uniqueName: "summary" },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "owners" },
    getRecentTransactionsUseCase: {
      execute: jest.fn(),
      uniqueName: "transactions",
    },
    getStockAttentionUseCase: { execute: jest.fn(), uniqueName: "stock" },
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
const summary = new MonthSummaryDTO({ balance: 100, expense: 50, income: 150 });
const stock = new StockAttentionDTO({
  attentionCount: 0,
  items: [],
  totalItems: 2,
});
const transactions = [
  new RecentTransactionDTO({
    categoryName: "Groceries",
    date: new Date(2026, 9, 3).toISOString(),
    description: "Market",
    id: "t1",
    type: "EXPENSE",
    value: 1000,
  }),
];

const mocks = { family, owners, person, stock, summary, transactions, user };

const queries = {
  owners: new UseQueryFixture<OwnerDTO[]>(),
  stock: new UseQueryFixture<StockAttentionDTO>(),
  summary: new UseQueryFixture<MonthSummaryDTO>(),
  transactions: new UseQueryFixture<RecentTransactionDTO[]>(),
  user: new UseQueryFixture<UserDTO>(),
};

// endregion mocks

// region spies

const spies = {
  getMonthSummary: jest.mocked(useCases.getMonthSummaryUseCase.execute),
  getRecentTransactions: jest.mocked(
    useCases.getRecentTransactionsUseCase.execute,
  ),
  getStockAttention: jest.mocked(useCases.getStockAttentionUseCase.execute),
  isFocused: jest.mocked(useIsFocused),
  push: jest.mocked(router.push),
  useBreakpoint: jest.mocked(useBreakpoint),
  useQuery: jest.mocked(useQuery),
};

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  resetHomeOwnerFilter();
  Object.values(queries).forEach((query) => query.reset());
  spies.isFocused.mockReturnValue(false);
  spies.useBreakpoint.mockReturnValue("compact");
});

type QueryName = keyof typeof queries;

// The options each query was created with (cacheKey, enabled, fetch).
function optionsOf(name: QueryName) {
  const calls = spies.useQuery.mock.calls.filter(
    ([options]) => options.cacheKey[0] === name,
  );

  return calls[calls.length - 1][0];
}

// Routes each useQuery call to its fixture through the use case uniqueName in the cache key.
function setup(data: Partial<Record<QueryName, unknown>> = {}) {
  (Object.keys(data) as QueryName[]).forEach((name) => {
    (queries[name] as UseQueryFixture<unknown>).withData(data[name]);
  });

  spies.useQuery.mockImplementation(((options: { cacheKey: string[] }) =>
    queries[options.cacheKey[0] as QueryName].build()) as never);

  return renderHook(() => useHomeViewModel());
}

const loaded = { owners, stock, summary, transactions, user };

export { act, loaded, mocks, optionsOf, queries, setup, spies };
