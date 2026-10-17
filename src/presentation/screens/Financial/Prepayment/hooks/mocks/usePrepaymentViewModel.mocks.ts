import { router, useLocalSearchParams } from "expo-router";

import { renderHook } from "@tests";

import {
  CreditCardSummaryDTO,
  InvoiceDTO,
} from "@application/dto/financial/CreditCardOverviewDTO";
import InstallmentPlanDTO from "@application/dto/financial/InstallmentPlanDTO";
import PrepaymentPreviewDTO from "@application/dto/financial/PrepaymentPreviewDTO";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import usePrepaymentViewModel from "../usePrepaymentViewModel";

jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher", () => ({
  invalidateFetcherData: jest.fn(),
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    getFinancialAccountsUseCase: { execute: jest.fn(), uniqueName: "accounts" },
    getFinancialCardInvoicesForMonthUseCase: {
      execute: jest.fn(),
      uniqueName: "invoices",
    },
    getFinancialCardInvoiceUseCase: {
      execute: jest.fn(),
      uniqueName: "invoice",
    },
    getFinancialCreditCardsOverviewUseCase: {
      execute: jest.fn(),
      uniqueName: "overview",
    },
    getFinancialInstallmentPlanUseCase: {
      execute: jest.fn(),
      uniqueName: "plan",
    },
    getFinancialTransactionsUseCase: {
      execute: jest.fn(),
      uniqueName: "transactions",
    },
    getMonthSummaryUseCase: { execute: jest.fn(), uniqueName: "summary" },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "owners" },
    prepayFinancialInstallmentPlanUseCase: {
      execute: jest.fn(),
      uniqueName: "prepay",
    },
    previewFinancialPrepaymentUseCase: {
      execute: jest.fn(),
      uniqueName: "preview",
    },
  },
}));

const queries: Record<string, UseQueryFixture<unknown>> = {};
const mutations: Record<string, UseMutationFixture<unknown, unknown>> = {};

function invoice(referenceMonth: string, total: number, payment?: object) {
  return new InvoiceDTO({
    amount: Math.max(0, total),
    amountDue: Math.max(0, total),
    carryIn: 0,
    closingDate: `${referenceMonth}-10`,
    dueDate: `${referenceMonth}-20`,
    earlyPaid: 0,
    listDate: `${referenceMonth}-20`,
    net: total,
    payment: payment as never,
    paymentAfterDue: false,
    paymentDate: `${referenceMonth}-20`,
    periodEnd: `${referenceMonth}-10`,
    periodStart: `${referenceMonth}-01`,
    referenceMonth,
    status: "OPEN",
    total,
  });
}

const plan = new InstallmentPlanDTO({
  categoryId: "cat-1",
  creditCardId: "card-1",
  date: new Date(2026, 9, 20).toISOString(),
  description: "Notebook",
  id: "plan-1",
  installmentCount: 10,
  installments: [],
  owner: "USER",
  ownerId: "user-id",
  totalValue: "5120.00",
});
const summary = {
  card: { id: "card-1" },
  closedInvoices: [invoice("2026-09", 100000)],
  openInvoice: invoice("2026-10", 0),
} as unknown as CreditCardSummaryDTO;
const preview = new PrepaymentPreviewDTO({
  eligible: [4, 5, 6].map((installmentNumber) => ({
    id: `tx-${installmentNumber}`,
    installmentNumber,
    invoiceMonth: "2026-11",
    value: 51200,
  })),
  total: 153600,
});

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
  ["plan", "overview", "preview"].forEach((key) => {
    queries[key] = new UseQueryFixture<unknown>();
  });
  ["prepay"].forEach((key) => {
    mutations[key] = new UseMutationFixture<unknown, unknown>();
  });
  spies.params.mockReturnValue({ planId: "plan-1" });
  spies.useQuery.mockImplementation(((options: { cacheKey: string[] }) =>
    queries[
      options.cacheKey[0] === "preview" ? "preview" : options.cacheKey[0]
    ].build()) as never);
  spies.useMutation.mockImplementation(((options: { cacheKey: string[] }) =>
    mutations[options.cacheKey[0]].build()) as never);
});

function givenLoaded() {
  queries.plan.withData(plan);
  queries.overview.withData({ cards: [summary] });
  queries.preview.withData(preview);
}

function setup() {
  return renderHook(() => usePrepaymentViewModel());
}

export { givenLoaded, mutations, preview, queries, setup, spies };
