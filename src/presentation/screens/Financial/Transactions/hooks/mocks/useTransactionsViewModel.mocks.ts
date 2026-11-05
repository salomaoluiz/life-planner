import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";

import { renderHook } from "@tests";
import queryName from "@tests/queryName";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { refetchStaleFetcherData, useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import useOwners from "@presentation/hooks/useOwners";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";

import CardInvoiceUIModel from "../../models/CardInvoiceUIModel";
import {
  DayBalanceView,
  ProjectedInvoiceGroup,
} from "../../models/transactionList";
import TransactionUIModel from "../../models/TransactionUIModel";
import { resetTransactionFilters } from "../useTransactionFilters";
import useTransactionsViewModel from "../useTransactionsViewModel";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/hooks/useOwners");
jest.mock("@presentation/hooks/useOwnerScopedQuery");
jest.mock("@presentation/i18n/useTranslationLocale", () => ({
  __esModule: true,
  default: () => ({ getLocale: () => ({ languageTag: "en-US" }) }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    getFinancialAccountsUseCase: { execute: jest.fn(), uniqueName: "accounts" },
    getFinancialCardInvoicesForMonthUseCase: {
      execute: jest.fn(),
      uniqueName: "invoices",
    },
    getFinancialCategoriesUseCase: {
      execute: jest.fn(),
      uniqueName: "categories",
    },
    getFinancialDailyBalancesUseCase: {
      execute: jest.fn(),
      uniqueName: "dailyBalances",
    },
    getFinancialFilteredTransactionsUseCase: {
      execute: jest.fn(),
      uniqueName: "filteredTransactions",
    },
    getFinancialMonthUseCase: { execute: jest.fn(), uniqueName: "month" },
    getFinancialProjectionsUseCase: {
      execute: jest.fn(),
      uniqueName: "projections",
    },
    getFinancialTransactionsUseCase: {
      execute: jest.fn(),
      uniqueName: "transactions",
    },
    getMonthSummaryUseCase: { execute: jest.fn(), uniqueName: "summary" },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "owners" },
  },
}));

// region mocks
const owners = [
  new OwnerDTO({ id: "user-id", name: "Alice Test", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Test Family", type: OwnerType.FAMILY }),
];

function dto(
  id: string,
  date: Date,
  ownerId = "user-id",
  type = "EXPENSE",
  value = "10.00",
) {
  return new TransactionDTO({
    accountId: "account-id",
    accountName: "Checking",
    category: "cat-1",
    categoryId: "cat-1",
    categoryName: "Food",
    date: date.toISOString(),
    description: id,
    id,
    owner: ownerId === "user-id" ? "USER" : "FAMILY",
    ownerId,
    type,
    value,
  });
}

const category = new CategoryDTO({
  icon: "food",
  iconColor: "#F59E0B",
  id: "cat-1",
  name: "Food",
  owner: "USER",
  ownerId: "user-id",
  type: "EXPENSE",
});

const transactionsQuery = new UseQueryFixture<{
  items: TransactionUIModel[];
}>();
const ownersQuery = new UseQueryFixture<OwnerDTO[]>();
const invoicesQuery = new UseQueryFixture<CardInvoiceUIModel[]>();
const projectionsQuery = new UseQueryFixture<{
  accountItems: TransactionUIModel[];
  cardGroups: ProjectedInvoiceGroup[];
}>();
const balancesQuery = new UseQueryFixture<Map<string, DayBalanceView>>();
const accountsQuery = new UseQueryFixture<unknown>();
const filteredTransactionsQuery = new UseQueryFixture<TransactionUIModel[]>();
const filteredInvoicesQuery = new UseQueryFixture<CardInvoiceUIModel[]>();
const filteredProjectionsQuery = new UseQueryFixture<{
  accountItems: TransactionUIModel[];
  cardGroups: ProjectedInvoiceGroup[];
}>();
const summaryQuery = new UseQueryFixture<{
  balance: number;
  expense: number;
  income: number;
  projectedExpense?: number;
  projectedIncome?: number;
  toPay: number;
  toReceive: number;
}>();
// endregion mocks

// region spies
const spies = {
  getAccounts: jest.mocked(useCases.getFinancialAccountsUseCase.execute),
  getBalances: jest.mocked(useCases.getFinancialDailyBalancesUseCase.execute),
  getCategories: jest.mocked(useCases.getFinancialCategoriesUseCase.execute),
  getFilteredTransactions: jest.mocked(
    useCases.getFinancialFilteredTransactionsUseCase.execute,
  ),
  getInvoices: jest.mocked(
    useCases.getFinancialCardInvoicesForMonthUseCase.execute,
  ),
  getMonth: jest.mocked(useCases.getFinancialMonthUseCase.execute),
  getOwners: jest.mocked(useCases.getOwnersUseCase.execute),
  getProjections: jest.mocked(useCases.getFinancialProjectionsUseCase.execute),
  getSummary: jest.mocked(useCases.getMonthSummaryUseCase.execute),
  getTransactions: jest.mocked(
    useCases.getFinancialTransactionsUseCase.execute,
  ),
  isFocused: jest.mocked(useIsFocused),
  ownerScopedQuery: jest.mocked(useOwnerScopedQuery),
  push: jest.mocked(router.push),
  refetchStale: jest.mocked(refetchStaleFetcherData),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 5, 12));
  transactionsQuery.reset();
  accountsQuery.reset();
  ownersQuery.reset();
  summaryQuery.reset();
  balancesQuery.reset();
  invoicesQuery.reset();
  invoicesQuery.withData([]);
  projectionsQuery.reset();
  filteredTransactionsQuery.reset();
  filteredInvoicesQuery.reset();
  filteredProjectionsQuery.reset();
  resetTransactionFilters();
  spies.isFocused.mockReturnValue(false);
  jest.mocked(useOwners).mockImplementation(() => ownersQuery.build());
  // Spec 080: the screen reads ONE month query; the fixtures of the old separate queries are its parts.
  jest.mocked(useOwnerScopedQuery).mockImplementation((() => {
    const query = transactionsQuery.build();

    return {
      ...query,
      data: query.data && {
        balances: balancesQuery.value.data ?? new Map(),
        invoices: invoicesQuery.value.data ?? [],
        projections: projectionsQuery.value.data ?? {
          accountItems: [],
          cardGroups: [],
        },
        summary: summaryQuery.value.data ?? {
          balance: 0,
          expense: 0,
          income: 0,
          toPay: 0,
          toReceive: 0,
        },
        ...query.data,
      },
      error:
        query.error ?? invoicesQuery.value.error ?? summaryQuery.value.error,
    };
  }) as never);
  spies.useQuery.mockImplementation(((options: { cacheKey: string[] }) => {
    if (queryName(options.cacheKey) === "accounts") {
      return accountsQuery.build();
    }
    if (queryName(options.cacheKey) === "summary") {
      return summaryQuery.build();
    }
    if (queryName(options.cacheKey) === "dailyBalances") {
      return balancesQuery.build();
    }
    if (queryName(options.cacheKey) === "filteredTransactions") {
      return filteredTransactionsQuery.build();
    }
    if (queryName(options.cacheKey) === "projections") {
      return options.cacheKey.includes("filtered")
        ? filteredProjectionsQuery.build()
        : projectionsQuery.build();
    }
    if (queryName(options.cacheKey) === "invoices") {
      return options.cacheKey.includes("filtered")
        ? filteredInvoicesQuery.build()
        : invoicesQuery.build();
    }

    return transactionsQuery.build();
  }) as never);
});

function archivedFamily(id: string) {
  return new OwnerDTO({
    archived: true,
    id,
    name: "Old Family",
    type: OwnerType.FAMILY,
  });
}

function givenData(
  items: TransactionUIModel[],
  withOwners: OwnerDTO[] = owners,
) {
  transactionsQuery.withData({ items });
  ownersQuery.withData(withOwners);
  summaryQuery.withData({
    balance: 4000,
    expense: 1000,
    income: 5000,
    toPay: 700,
    toReceive: 900,
  });
}

function setup() {
  return renderHook(() => useTransactionsViewModel());
}

function ui(
  id: string,
  date: Date,
  ownerId = "user-id",
  type = "EXPENSE",
  value = "10.00",
) {
  return new TransactionUIModel(dto(id, date, ownerId, type, value), category);
}

export {
  accountsQuery,
  archivedFamily,
  balancesQuery,
  dto,
  filteredInvoicesQuery,
  filteredProjectionsQuery,
  filteredTransactionsQuery,
  givenData,
  invoicesQuery,
  owners,
  ownersQuery,
  projectionsQuery,
  setup,
  spies,
  summaryQuery,
  transactionsQuery,
  ui,
};
