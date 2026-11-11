import { useLocalSearchParams } from "expo-router";

import { act, renderHook } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import AccountDTO from "@application/dto/financial/AccountDTO";
import { InvestmentIncomeReceived } from "@domain/entities/errors";
import { InvestmentIncomeStatus } from "@domain/entities/investment/enums";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import {
  makeDetail,
  makeIncome,
  owners,
} from "@screens/Investment/mocks/fixtures";

import useIncomeReceiveModalViewModel from "./useIncomeReceiveModalViewModel";

jest.mock("expo-router", () => ({ useLocalSearchParams: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/hooks/useOwnerScopedQuery");
jest.mock("@screens/Investment/hooks/invalidateInvestments");
jest.mock("@application/useCases", () => ({
  useCases: {
    deleteInvestmentIncomeUseCase: { execute: jest.fn(), uniqueName: "delete" },
    getFinancialAccountsUseCase: { execute: jest.fn(), uniqueName: "accounts" },
    getInvestmentAssetUseCase: { execute: jest.fn(), uniqueName: "asset" },
    getInvestmentIncomeUseCase: { execute: jest.fn(), uniqueName: "income" },
    receiveInvestmentIncomeUseCase: {
      execute: jest.fn(),
      uniqueName: "receive",
    },
  },
}));

const incomeQuery = new UseQueryFixture();
const assetQuery = new UseQueryFixture();
const accountsQuery = new UseQueryFixture();
const receiveMutation = new UseMutationFixture();
const deleteMutation = new UseMutationFixture();

function account(id: string, name: string, overrides = {}) {
  return new AccountDTO({
    balance: 0,
    icon: "bank",
    id,
    name,
    owner: "USER",
    ownerId: "user-1",
    status: "ACTIVE",
    ...overrides,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date(2026, 10, 4, 12));
  incomeQuery.reset().withData(
    makeIncome({
      netAmount: 7140,
      overdue: false,
      status: InvestmentIncomeStatus.PLANNED,
    }),
  );
  assetQuery.reset().withData(makeDetail());
  accountsQuery.reset().withData({
    accounts: [
      account("acc-1", "Main"),
      account("acc-usd", "Dollar", { currency: "USD" }),
    ],
    owners,
  });
  receiveMutation.reset();
  deleteMutation.reset();
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: "income-1" });
  jest
    .mocked(useQuery)
    .mockImplementation(((props: { cacheKey: string[] }) =>
      (props.cacheKey.join("/").includes("/income/")
        ? incomeQuery
        : assetQuery
      ).build()) as never);
  jest
    .mocked(useOwnerScopedQuery)
    .mockImplementation((() => accountsQuery.build()) as never);
  jest
    .mocked(useMutation)
    .mockImplementation(((props: { cacheKey: string[] }) =>
      (props.cacheKey[0] === "delete"
        ? deleteMutation
        : receiveMutation
      ).build()) as never);
});
afterEach(() => jest.useRealTimers());

function setup() {
  return renderHook(() => useIncomeReceiveModalViewModel());
}

it("SHOULD open with the planned value, its account AND today", () => {
  const { result } = setup();

  expect(result.current).toMatchObject({
    accountId: "acc-1",
    net: 7140,
    planned: "R$71.40",
    showGross: true,
    typeKey: "investment.income.types.JCP",
  });
  expect(result.current.accountOptions).toEqual([
    { label: "Main", value: "acc-1" },
  ]);
  expect(result.current.receivedOn).toEqual(new Date(2026, 10, 4, 12));
});

it("SHOULD confirm with the typed amount, date AND account", () => {
  const { result } = setup();

  act(() => result.current.onNetChange(7215));
  act(() => result.current.onReceivedOnChange(new Date(2026, 10, 3)));
  act(() => result.current.onAccountChange("acc-2"));
  act(() => result.current.onSave());

  expect(receiveMutation.value.mutate).toHaveBeenCalledWith({
    accountId: "acc-2",
    id: "income-1",
    netAmount: 7215,
    receivedOn: "2026-11-03",
  });
});

it("SHOULD not confirm without an amount", () => {
  const { result } = setup();

  act(() => result.current.onNetChange(0));
  act(() => result.current.onSave());

  expect(receiveMutation.value.mutate).not.toHaveBeenCalled();
});

it("SHOULD estimate the gross of a JCP", () => {
  incomeQuery.withData(makeIncome({ status: InvestmentIncomeStatus.PLANNED }));
  const { result } = setup();

  expect(result.current).toMatchObject({
    gross: "R$84.00",
    grossRate: "15%",
    showGross: true,
  });
});

it("SHOULD delete the income", () => {
  const { result } = setup();

  act(() => result.current.onDelete());

  expect(deleteMutation.value.mutate).toHaveBeenCalledWith("income-1");
});

it("SHOULD invalidate AND close WHEN it succeeds, showing the failure otherwise", () => {
  receiveMutation.value.status = "success";
  setup();

  expect(invalidateInvestments).toHaveBeenCalled();
  expect(modalNavigation.closeModal).toHaveBeenCalled();

  receiveMutation.reset().withError(new InvestmentIncomeReceived());
  expect(setup().result.current.failure).toEqual({
    key: "investment.income.errors.received",
  });
});

it("SHOULD be loading, then not found WHEN the income fails", () => {
  incomeQuery.reset();
  incomeQuery.value.isFetching = true;
  expect(setup().result.current.isLoading).toBe(true);

  incomeQuery.reset().withError();
  expect(setup().result.current.isNotFound).toBe(true);
});
