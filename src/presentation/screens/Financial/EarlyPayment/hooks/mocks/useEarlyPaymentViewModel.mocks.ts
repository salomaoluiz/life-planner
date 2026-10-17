import { router, useLocalSearchParams } from "expo-router";

import { renderHook } from "@tests";

import AccountDTO from "@application/dto/financial/AccountDTO";
import {
  CreditCardSummaryDTO,
  InvoiceDTO,
} from "@application/dto/financial/CreditCardOverviewDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import useEarlyPaymentViewModel from "../useEarlyPaymentViewModel";

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
    "getFinancialAccountsUseCase",
    "getFinancialCardInvoiceUseCase",
    "getFinancialTransactionsUseCase",
    "getFinancialCardInvoicesForMonthUseCase",
    "getMonthSummaryUseCase",
    "createFinancialEarlyPaymentUseCase",
    "updateFinancialEarlyPaymentUseCase",
    "deleteFinancialEarlyPaymentUseCase",
  ];

  return {
    useCases: Object.fromEntries(
      names.map((name) => [name, { execute: jest.fn(), uniqueName: name }]),
    ),
  };
});

const queries: Record<string, UseQueryFixture<unknown>> = {};
const mutations: Record<string, UseMutationFixture<unknown, unknown>> = {};

function account(id: string, status = "ACTIVE") {
  return new AccountDTO({
    balance: 0,
    icon: "bank",
    id,
    name: id,
    owner: "USER",
    ownerId: "user-id",
    status,
  } as never);
}

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

// Closing day 10, today 2026-10-16: November is open (no purchases), October closed with 1.000,00 to pay.
const summary = {
  card: { closingDay: 10, id: "card-1", title: "Main card" },
  closedInvoices: [invoice("2026-10", 100000)],
  openInvoice: invoice("2026-11", 0),
} as unknown as CreditCardSummaryDTO;
const stored = {
  credits: [
    {
      accountId: "a1",
      date: "2026-10-16",
      description: "Early payment",
      id: "early-1",
      kind: "EARLY_PAYMENT",
      method: "ACCOUNT",
      value: 60000,
    },
  ],
};

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
    "getFinancialAccountsUseCase",
    "getFinancialCardInvoiceUseCase",
  ].forEach((key) => {
    queries[key] = new UseQueryFixture<unknown>();
  });
  [
    "createFinancialEarlyPaymentUseCase",
    "updateFinancialEarlyPaymentUseCase",
    "deleteFinancialEarlyPaymentUseCase",
  ].forEach((key) => {
    mutations[key] = new UseMutationFixture<unknown, unknown>();
  });
  spies.params.mockReturnValue({
    creditCardId: "card-1",
    invoiceMonth: "2026-10",
  });
  spies.useQuery.mockImplementation(((options: { cacheKey: string[] }) =>
    queries[options.cacheKey[0]].build()) as never);
  spies.useMutation.mockImplementation(((options: { cacheKey: string[] }) =>
    mutations[options.cacheKey[0]].build()) as never);
});

function givenLoaded(withStored = false) {
  queries.getOwnersUseCase.withData([
    new OwnerDTO({ id: "user-id", name: "Alice", type: OwnerType.USER }),
  ]);
  queries.getFinancialCreditCardsOverviewUseCase.withData({ cards: [summary] });
  queries.getFinancialAccountsUseCase.withData([
    account("a1"),
    account("old", "ARCHIVED"),
  ]);

  if (withStored) {
    queries.getFinancialCardInvoiceUseCase.withData(stored);
  }
}

function setup() {
  return renderHook(() => useEarlyPaymentViewModel());
}

export { givenLoaded, mutations, setup, spies };
