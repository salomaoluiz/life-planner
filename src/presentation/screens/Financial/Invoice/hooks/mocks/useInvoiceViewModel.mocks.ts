import { router, useLocalSearchParams } from "expo-router";

import { renderHook } from "@tests";

import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import CardInvoiceUIModel from "@screens/Financial/Transactions/models/CardInvoiceUIModel";

import useInvoiceViewModel from "../useInvoiceViewModel";

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), replace: jest.fn() },
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
    getMonthSummaryUseCase: { execute: jest.fn(), uniqueName: "summary" },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "owners" },
    payFinancialInvoiceUseCase: { execute: jest.fn(), uniqueName: "pay" },
    undoFinancialInvoicePaymentUseCase: {
      execute: jest.fn(),
      uniqueName: "undo",
    },
  },
}));

const owners = [
  new OwnerDTO({ id: "user-id", name: "Alice", type: OwnerType.USER }),
];
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

const spies = {
  back: jest.mocked(router.back),
  getCategories: jest.mocked(useCases.getFinancialCategoriesUseCase.execute),
  getProjections: jest.mocked(useCases.getFinancialProjectionsUseCase.execute),
  invalidate: jest.mocked(invalidateFetcherData),
  params: jest.mocked(useLocalSearchParams),
  replace: jest.mocked(router.replace),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date(2026, 10, 5, 12));
  ["invoice", "owners", "accounts", "projections", "cards"].forEach((key) => {
    queries[key] = new UseQueryFixture<unknown>();
  });
  ["pay", "undo"].forEach((key) => {
    mutations[key] = new UseMutationFixture<unknown, unknown>();
  });
  spies.params.mockReturnValue({ cardId: "card-1", month: "2026-10" });
  spies.useQuery.mockImplementation(((options: { cacheKey: string[] }) =>
    queries[options.cacheKey[0]].build()) as never);
  spies.useMutation.mockImplementation(((options: { cacheKey: string[] }) =>
    mutations[options.cacheKey[0]].build()) as never);
});

function givenLoaded(
  data: {
    accounts?: AccountDTO[];
    invoice?: CardInvoiceUIModel;
    linkedAccountId?: string;
  } = {},
) {
  if (data.invoice) {
    queries.invoice.withData(data.invoice);
  }
  queries.owners.withData(owners);
  queries.accounts.withData(data.accounts ?? [account("a1")]);
  queries.cards.withData([
    { id: "card-1", paymentAccountId: data.linkedAccountId } as never,
  ]);
}

function setup() {
  return renderHook(() => useInvoiceViewModel());
}

export { account, givenLoaded, mutations, queries, setup, spies };
