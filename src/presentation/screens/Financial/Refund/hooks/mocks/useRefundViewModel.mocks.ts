import { router, useLocalSearchParams } from "expo-router";

import { renderHook } from "@tests";

import {
  CreditCardSummaryDTO,
  InvoiceDTO,
} from "@application/dto/financial/CreditCardOverviewDTO";
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

import useRefundViewModel from "../useRefundViewModel";

jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher", () => ({
  invalidateFetcherData: jest.fn(),
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}));
jest.mock("@application/useCases", () => {
  const names = [
    "getOwnersUseCase",
    "getFinancialCreditCardsOverviewUseCase",
    "getFinancialTransactionsUseCase",
    "createFinancialRefundUseCase",
    "updateFinancialRefundUseCase",
    "deleteFinancialRefundUseCase",
    "getFinancialCardInvoiceUseCase",
    "getFinancialCardInvoicesForMonthUseCase",
    "getFinancialAccountsUseCase",
    "getMonthSummaryUseCase",
  ];

  return {
    useCases: Object.fromEntries(
      names.map((name) => [name, { execute: jest.fn(), uniqueName: name }]),
    ),
  };
});

const queries: Record<string, UseQueryFixture<unknown>> = {};
const mutations: Record<string, UseMutationFixture<unknown, unknown>> = {};

function invoice(referenceMonth: string, total: number) {
  return new InvoiceDTO({
    amount: Math.max(0, total),
    amountDue: Math.max(0, total),
    carryIn: 0,
    closingDate: `${referenceMonth}-10`,
    dueDate: `${referenceMonth}-20`,
    earlyPaid: 0,
    listDate: `${referenceMonth}-20`,
    net: total,
    paymentAfterDue: false,
    paymentDate: `${referenceMonth}-20`,
    periodEnd: `${referenceMonth}-10`,
    periodStart: `${referenceMonth}-01`,
    referenceMonth,
    status: "OPEN",
    total,
  });
}

function row(
  overrides: Partial<ConstructorParameters<typeof TransactionDTO>[0]>,
) {
  return new TransactionDTO({
    category: "Tech",
    categoryId: "cat-1",
    creditCardId: "card-1",
    date: "2026-10-03T00:00:00.000Z",
    description: "Notebook",
    id: "t1",
    owner: "USER",
    ownerId: "user-id",
    type: "EXPENSE",
    value: "10.00",
    ...overrides,
  });
}

// Closing day 10 and today 2026-10-16: November is the open invoice, October the closed one.
const summary = {
  card: { closingDay: 10, id: "card-1", title: "Main card" },
  closedInvoices: [invoice("2026-10", 30000)],
  openInvoice: invoice("2026-11", 0),
} as unknown as CreditCardSummaryDTO;

const spies = {
  back: jest.mocked(router.back),
  invalidate: jest.mocked(invalidateFetcherData),
  params: jest.mocked(useLocalSearchParams),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 16, 12));
  [
    "getOwnersUseCase",
    "getFinancialCreditCardsOverviewUseCase",
    "getFinancialTransactionsUseCase",
  ].forEach((key) => {
    queries[key] = new UseQueryFixture<unknown>();
  });
  [
    "createFinancialRefundUseCase",
    "updateFinancialRefundUseCase",
    "deleteFinancialRefundUseCase",
  ].forEach((key) => {
    mutations[key] = new UseMutationFixture<unknown, unknown>();
  });
  spies.params.mockReturnValue({ creditCardId: "card-1" });
  spies.useQuery.mockImplementation(((options: { cacheKey: string[] }) =>
    queries[options.cacheKey[0]].build()) as never);
  spies.useMutation.mockImplementation(((options: { cacheKey: string[] }) =>
    mutations[options.cacheKey[0]].build()) as never);
});

function givenLoaded() {
  queries.getOwnersUseCase.withData([
    new OwnerDTO({ id: "user-id", name: "Alice", type: OwnerType.USER }),
  ]);
  queries.getFinancialCreditCardsOverviewUseCase.withData({ cards: [summary] });
  queries.getFinancialTransactionsUseCase.withData([
    row({}),
    row({ description: "TV", id: "t2" }),
    row({ description: "Phone", id: "i1", installmentPlanId: "plan-1" }),
  ]);
}

function setup() {
  return renderHook(() => useRefundViewModel());
}

export { givenLoaded, mutations, row, setup, spies };
