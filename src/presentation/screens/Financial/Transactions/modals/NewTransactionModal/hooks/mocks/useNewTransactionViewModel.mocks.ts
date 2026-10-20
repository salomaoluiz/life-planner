import { useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";

import { renderHook } from "@tests";

import AccountDTO from "@application/dto/financial/AccountDTO";
import CategoryDTO from "@application/dto/financial/CategoryDTO";
import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import CreditCardOverviewDTO from "@application/dto/financial/CreditCardOverviewDTO";
import ProjectedOccurrenceDTO from "@application/dto/financial/ProjectedOccurrenceDTO";
import RecurrenceDTO from "@application/dto/financial/RecurrenceDTO";
import TagDTO from "@application/dto/financial/TagDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import useNewTransactionViewModel from "../useNewTransactionViewModel";

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
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
    getFinancialTransactionsUseCase: {
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
  params: jest.mocked(useLocalSearchParams),
  push: jest.mocked(router.push),
  replace: jest.mocked(router.replace),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 5, 12));
  [
    "owners",
    "accounts",
    "cards",
    "overview",
    "categories",
    "tags",
    "transactions",
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
  spies.focused.mockReturnValue(false);
  spies.params.mockReturnValue({});
  spies.useQuery.mockImplementation(((options: { cacheKey: string[] }) =>
    queries[options.cacheKey[0]].build()) as never);
  spies.useMutation.mockImplementation(((options: { cacheKey: string[] }) =>
    mutations[options.cacheKey[0]].build()) as never);
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
  queries.transactions.withData(data.transactions ?? []);
  queries.projections.withData(data.projected ?? []);
  queries.recurrences.withData(data.series ?? []);
  queries.most_used.withData(data.top ?? [cat("food")]);
  spies.params.mockReturnValue(data.params ?? {});
}

function setup() {
  return renderHook(() => useNewTransactionViewModel());
}

export { acc, card, cat, givenLoaded, mutations, queries, setup, spies, tx };
