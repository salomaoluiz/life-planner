import { useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";

import { renderHook } from "@tests";
import queryName from "@tests/queryName";

import AccountDTO from "@application/dto/financial/AccountDTO";
import CategoryDTO from "@application/dto/financial/CategoryDTO";
import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import CreditCardOverviewDTO from "@application/dto/financial/CreditCardOverviewDTO";
import ProjectedOccurrenceDTO from "@application/dto/financial/ProjectedOccurrenceDTO";
import RecurrenceDTO from "@application/dto/financial/RecurrenceDTO";
import TagDTO from "@application/dto/financial/TagDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import {
  getCachedFetcherData,
  refetchStaleFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import openTransactionModal from "@screens/Financial/Transactions/pending/openTransactionModal";
import runPendingChange from "@screens/Financial/Transactions/pending/runPendingChange";
import { invalidateAfterWrite } from "@screens/Financial/Transactions/pending/writeCache";

import useNewTransactionViewModel from "../useNewTransactionViewModel";

jest.mock("@screens/Financial/Transactions/pending/writeCache");
jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
// Spec 061: the optimistic paths hand their request to the runner; here it just runs it.
jest.mock("@screens/Financial/Transactions/pending/runPendingChange", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock(
  "@screens/Financial/Transactions/pending/openTransactionModal",
  () => ({
    __esModule: true,
    default: jest.fn(),
  }),
);
jest.mock("@application/useCases", () => ({
  useCases: {
    createFinancialInstallmentPlanUseCase: {
      execute: jest.fn(),
      uniqueName: "create_plan",
    },
    createFinancialRecurrenceUseCase: {
      execute: jest.fn(),
      uniqueName: "create_recurrence",
    },
    createFinancialTransactionUseCase: {
      execute: jest.fn(),
      uniqueName: "create",
    },
    deleteFinancialOccurrenceUseCase: {
      execute: jest.fn(),
      uniqueName: "delete_occurrence",
    },
    deleteFinancialRecurrenceUseCase: {
      execute: jest.fn(),
      uniqueName: "delete_recurrence",
    },
    deleteFinancialTransactionUseCase: {
      execute: jest.fn(),
      uniqueName: "delete",
    },
    getFinancialAccountsUseCase: { execute: jest.fn(), uniqueName: "accounts" },
    getFinancialCategoriesUseCase: {
      execute: jest.fn(),
      uniqueName: "categories",
    },
    getFinancialCreditCardsOverviewUseCase: {
      execute: jest.fn(),
      uniqueName: "overview",
    },
    getFinancialCreditCardsUseCase: { execute: jest.fn(), uniqueName: "cards" },
    getFinancialProjectionsUseCase: {
      execute: jest.fn(),
      uniqueName: "projections",
    },
    getFinancialRecurrencesUseCase: {
      execute: jest.fn(),
      uniqueName: "recurrences",
    },
    getFinancialTagsUseCase: { execute: jest.fn(), uniqueName: "tags" },
    getFinancialTransactionByIdUseCase: {
      execute: jest.fn(),
      uniqueName: "transactions",
    },
    getMostUsedFinancialCategoriesUseCase: {
      execute: jest.fn(),
      uniqueName: "most_used",
    },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "owners" },
    materializeFinancialOccurrenceUseCase: {
      execute: jest.fn(),
      uniqueName: "materialize",
    },
    splitFinancialRecurrenceUseCase: {
      execute: jest.fn(),
      uniqueName: "split",
    },
    updateFinancialRecurrenceUseCase: {
      execute: jest.fn(),
      uniqueName: "update_recurrence",
    },
    updateFinancialTransactionUseCase: {
      execute: jest.fn(),
      uniqueName: "update",
    },
  },
}));

// region mocks
const owners = [
  new OwnerDTO({ id: "user-id", name: "Alice", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Family", type: OwnerType.FAMILY }),
];

function acc(id: string, ownerId = "user-id", status = "ACTIVE") {
  return new AccountDTO({
    balance: 0,
    icon: "bank",
    id,
    name: id,
    owner: ownerId === "user-id" ? "USER" : "FAMILY",
    ownerId,
    status,
  } as never);
}

function card(
  id: string,
  overrides: Partial<ConstructorParameters<typeof CreditCardDTO>[0]> = {},
) {
  return new CreditCardDTO({
    brand: "VISA",
    closingDay: 31,
    color: "#2B3A8C",
    dueDay: 10,
    id,
    lastDigits: "1234",
    limit: 100000,
    owner: "USER",
    ownerId: "user-id",
    paymentDay: 5,
    status: "ACTIVE",
    title: id,
    ...overrides,
  });
}

function cat(
  id: string,
  ownerId = "user-id",
  type = "EXPENSE",
  color = "#F59E0B",
) {
  return new CategoryDTO({
    icon: "food",
    iconColor: color,
    id,
    name: id,
    owner: ownerId === "user-id" ? "USER" : "FAMILY",
    ownerId,
    type,
  } as never);
}

function tx(id: string, overrides = {}) {
  return new TransactionDTO({
    accountId: "a1",
    category: "Food",
    categoryId: "food",
    date: new Date(2026, 8, 30).toISOString(),
    description: "Shop",
    id,
    owner: "USER",
    ownerId: "user-id",
    type: "EXPENSE",
    value: "312.90",
    ...overrides,
  } as never);
}

const queries: Record<string, UseQueryFixture<unknown>> = {};
const mutations: Record<string, UseMutationFixture<unknown, unknown>> = {};
// endregion mocks

// region spies
const spies = {
  back: jest.mocked(router.back),
  focused: jest.mocked(useIsFocused),
  getCachedFetcherData: jest.mocked(getCachedFetcherData),
  invalidateAfterWrite: jest.mocked(invalidateAfterWrite),
  openTransactionModal: jest.mocked(openTransactionModal),
  params: jest.mocked(useLocalSearchParams),
  push: jest.mocked(router.push),
  refetchStale: jest.mocked(refetchStaleFetcherData),
  replace: jest.mocked(router.replace),
  runPendingChange: jest.mocked(runPendingChange),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 5, 12));
  // Fixtures a test added (e.g. another cached month) never leak into the next one.
  Object.keys(queries).forEach((key) => delete queries[key]);
  [
    "owners",
    "accounts",
    "cards",
    "overview",
    "categories",
    "tags",
    "transactions",
    "transactions_list",
    "most_used",
    "projections",
    "recurrences",
  ].forEach((key) => {
    queries[key] = new UseQueryFixture<unknown>();
  });
  [
    "create",
    "create_plan",
    "update",
    "delete",
    "create_recurrence",
    "update_recurrence",
    "split",
    "materialize",
    "delete_occurrence",
    "delete_recurrence",
  ].forEach((key) => {
    mutations[key] = new UseMutationFixture<unknown, unknown>();
  });
  spies.runPendingChange.mockImplementation(async (_change, execute) => {
    await execute();
  });
  spies.focused.mockReturnValue(false);
  spies.params.mockReturnValue({});
  spies.useQuery.mockImplementation(((options: { cacheKey: string[] }) =>
    queries[
      options.cacheKey[options.cacheKey[0] === "finance" ? 2 : 1] === "list"
        ? `${queryName(options.cacheKey)}_list`
        : queryName(options.cacheKey)
    ].build()) as never);
  spies.useMutation.mockImplementation(((options: { cacheKey: string[] }) =>
    mutations[queryName(options.cacheKey)].build()) as never);
  // The months the Transactions screen cached: every `*_list*` fixture that holds data.
  spies.getCachedFetcherData.mockImplementation(((cacheKey: string[]) =>
    Object.entries(queries)
      .filter(([key]) => key.startsWith(`${queryName(cacheKey)}_list`))
      .map(([, query]) => query.value.data)
      .filter((data) => data !== undefined)) as never);
});

function givenLoaded(
  data: {
    accounts?: AccountDTO[];
    cards?: CreditCardDTO[];
    categories?: CategoryDTO[];
    overview?: CreditCardOverviewDTO;
    params?: Record<string, string>;
    projected?: ProjectedOccurrenceDTO[];
    series?: RecurrenceDTO[];
    tags?: TagDTO[];
    top?: CategoryDTO[];
    transactions?: TransactionDTO[];
  } = {},
) {
  queries.owners.withData(owners);
  queries.accounts.withData(data.accounts ?? [acc("a1")]);
  queries.cards.withData(data.cards ?? []);
  queries.overview.withData(
    data.overview ??
      new CreditCardOverviewDTO({
        aggregate: { available: 0, totalLimit: 0, used: 0 },
        cards: [],
      }),
  );
  queries.categories.withData(
    data.categories ?? [cat("food"), cat("salary", "user-id", "INCOME")],
  );
  queries.tags.withData(data.tags ?? []);
  // The row of the edit, read by id (spec 077); `null` when the API does not have it.
  queries.transactions.withData(
    (data.transactions ?? []).find((row) => row.id === data.params?.id) ?? null,
  );
  queries.projections.withData(data.projected ?? []);
  queries.recurrences.withData(data.series ?? []);
  queries.most_used.withData(data.top ?? [cat("food")]);
  spies.params.mockReturnValue(data.params ?? {});
}

function setup() {
  return renderHook(() => useNewTransactionViewModel());
}

export {
  acc,
  card,
  cat,
  givenLoaded,
  mutations,
  queries,
  setup,
  spies,
  tx,
  useCases,
};
