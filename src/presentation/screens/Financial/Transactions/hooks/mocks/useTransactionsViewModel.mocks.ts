import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";

import { renderHook } from "@tests";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import TransactionUIModel from "../../models/TransactionUIModel";
import useTransactionsViewModel from "../useTransactionsViewModel";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/i18n/useTranslationLocale", () => ({
  __esModule: true,
  default: () => ({ getLocale: () => ({ languageTag: "en-US" }) }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    getFinancialCategoriesUseCase: {
      execute: jest.fn(),
      uniqueName: "categories",
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
  owners: OwnerDTO[];
}>();
const summaryQuery = new UseQueryFixture<{
  balance: number;
  expense: number;
  income: number;
}>();
// endregion mocks

// region spies
const spies = {
  getCategories: jest.mocked(useCases.getFinancialCategoriesUseCase.execute),
  getOwners: jest.mocked(useCases.getOwnersUseCase.execute),
  getSummary: jest.mocked(useCases.getMonthSummaryUseCase.execute),
  getTransactions: jest.mocked(
    useCases.getFinancialTransactionsUseCase.execute,
  ),
  isFocused: jest.mocked(useIsFocused),
  push: jest.mocked(router.push),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 5, 12));
  transactionsQuery.reset();
  summaryQuery.reset();
  spies.isFocused.mockReturnValue(false);
  spies.useQuery.mockImplementation(((options: { cacheKey: string[] }) =>
    options.cacheKey[0] === "summary"
      ? summaryQuery.build()
      : transactionsQuery.build()) as never);
});

function givenData(items: TransactionUIModel[]) {
  transactionsQuery.withData({ items, owners });
  summaryQuery.withData({ balance: 4000, expense: 1000, income: 5000 });
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
  dto,
  givenData,
  owners,
  setup,
  spies,
  summaryQuery,
  transactionsQuery,
  ui,
};
