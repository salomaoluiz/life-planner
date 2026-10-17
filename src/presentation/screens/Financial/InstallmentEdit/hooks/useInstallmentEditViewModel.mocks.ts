import { router, useLocalSearchParams } from "expo-router";

import { renderHook } from "@tests";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import InstallmentPlanDTO from "@application/dto/financial/InstallmentPlanDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import useInstallmentEditViewModel from "./useInstallmentEditViewModel";

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => {
  const names = [
    "getOwnersUseCase",
    "getFinancialTransactionsUseCase",
    "getFinancialInstallmentPlanUseCase",
    "getFinancialCreditCardsUseCase",
    "getFinancialCategoriesUseCase",
    "updateFinancialTransactionUseCase",
    "updateFinancialInstallmentPlanUseCase",
    "deleteFinancialInstallmentPlanUseCase",
    "undoFinancialPrepaymentUseCase",
    "getFinancialCardInvoiceUseCase",
    "getFinancialCardInvoicesForMonthUseCase",
    "getFinancialCreditCardsOverviewUseCase",
    "getFinancialAccountsUseCase",
    "getMonthSummaryUseCase",
  ];

  return {
    useCases: Object.fromEntries(
      names.map((name) => [name, { execute: jest.fn(), uniqueName: name }]),
    ),
  };
});

// region mocks
const owners = [
  new OwnerDTO({ id: "user-id", name: "Alice", type: OwnerType.USER }),
];

function makeCard(id: string, status = "ACTIVE") {
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
    status,
    title: id,
  } as never);
}

function makeCategory(id: string, type = "EXPENSE", ownerId = "user-id") {
  return new CategoryDTO({
    icon: "food",
    id,
    name: id,
    owner: "USER",
    ownerId,
    type,
  } as never);
}

function makePlan(statuses = ["OPEN", "OPEN", "OPEN"]) {
  return new InstallmentPlanDTO({
    categoryId: "cat-1",
    creditCardId: "card-1",
    date: new Date(2026, 9, 20).toISOString(),
    description: "Notebook",
    id: "plan-1",
    installmentCount: statuses.length,
    installments: statuses.map((status, index) => ({
      id: `row-${index + 1}`,
      installmentNumber: index + 1,
      invoiceMonth: `2026-1${index}`,
      invoiceStatus: status as "OPEN",
      value: index === 0 ? "33.34" : "33.33",
    })),
    owner: "USER",
    ownerId: "user-id",
    totalValue: "100.00",
  });
}

function makeRow(number = 2) {
  return new TransactionDTO({
    category: "Tech",
    categoryId: "cat-1",
    creditCardId: "card-1",
    date: new Date(2026, 9, 20).toISOString(),
    description: "Notebook",
    id: `row-${number}`,
    installmentCount: 3,
    installmentNumber: number,
    installmentPlanId: "plan-1",
    owner: "USER",
    ownerId: "user-id",
    type: "EXPENSE",
    value: number === 1 ? "33.34" : "33.33",
  });
}

const queries: Record<string, UseQueryFixture<unknown>> = {};
const mutations: Record<string, UseMutationFixture<unknown, unknown>> = {};
// endregion mocks

const spies = {
  back: jest.mocked(router.back),
  invalidate: jest.mocked(invalidateFetcherData),
  params: jest.mocked(useLocalSearchParams),
  replace: jest.mocked(router.replace),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};

beforeEach(() => {
  jest.clearAllMocks();
  [
    "getOwnersUseCase",
    "getFinancialTransactionsUseCase",
    "getFinancialInstallmentPlanUseCase",
    "getFinancialCreditCardsUseCase",
    "getFinancialCategoriesUseCase",
  ].forEach((key) => {
    queries[key] = new UseQueryFixture<unknown>();
  });
  [
    "updateFinancialTransactionUseCase",
    "updateFinancialInstallmentPlanUseCase",
    "deleteFinancialInstallmentPlanUseCase",
    "undoFinancialPrepaymentUseCase",
  ].forEach((key) => {
    mutations[key] = new UseMutationFixture<unknown, unknown>();
  });
  spies.params.mockReturnValue({ id: "row-2" });
  spies.useQuery.mockImplementation(((options: { cacheKey: string[] }) =>
    queries[options.cacheKey[0]].build()) as never);
  spies.useMutation.mockImplementation(((options: { cacheKey: string[] }) =>
    mutations[options.cacheKey[0]].build()) as never);
});

function givenLoaded(
  data: { plan?: InstallmentPlanDTO; rows?: TransactionDTO[] } = {},
) {
  queries.getOwnersUseCase.withData(owners);
  queries.getFinancialTransactionsUseCase.withData(
    data.rows ?? [makeRow(1), makeRow(2), makeRow(3)],
  );
  queries.getFinancialInstallmentPlanUseCase.withData(data.plan ?? makePlan());
  queries.getFinancialCreditCardsUseCase.withData([
    makeCard("card-1"),
    makeCard("card-2"),
    makeCard("card-archived", "ARCHIVED"),
  ]);
  queries.getFinancialCategoriesUseCase.withData([
    makeCategory("cat-1"),
    makeCategory("cat-2"),
    makeCategory("income", "INCOME"),
    makeCategory("other-owner", "EXPENSE", "family-1"),
  ]);
}

function setup() {
  return renderHook(() => useInstallmentEditViewModel());
}

export { givenLoaded, makePlan, makeRow, mutations, queries, setup, spies };
