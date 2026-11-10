import { useLocalSearchParams } from "expo-router";

import { act, renderHook } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import { InvestmentArchived } from "@domain/entities/errors";
import { InvestmentAssetDetail } from "@domain/entities/investment/InvestmentEntities";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { makeFixedIncomeDetail } from "@screens/Investment/mocks/fixtures";

import useFixedIncomeContributionViewModel from "./useFixedIncomeContributionViewModel";

jest.mock("expo-router", () => ({ useLocalSearchParams: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Investment/hooks/invalidateInvestments");
jest.mock("@screens/Investment/FixedIncome/hooks/useEligibleAccounts", () => ({
  __esModule: true,
  default: () => ({
    accounts: [{ id: "acc-1" }],
    isLoaded: true,
    options: [{ label: "Broker · BRL", value: "acc-1" }],
  }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    createInvestmentFixedIncomeContributionUseCase: {
      execute: jest.fn(),
      uniqueName: "contribute",
    },
    getInvestmentAssetUseCase: { execute: jest.fn(), uniqueName: "get" },
  },
}));

const detailQuery = new UseQueryFixture<InvestmentAssetDetail>();
const mutation = new UseMutationFixture();

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date(2026, 10, 4, 12));
  detailQuery.reset().withData(makeFixedIncomeDetail());
  mutation.reset();
  jest.mocked(useLocalSearchParams).mockReturnValue({ assetId: "asset-fi" });
  jest
    .mocked(useQuery)
    .mockImplementation((() => detailQuery.build()) as never);
  jest
    .mocked(useMutation)
    .mockImplementation((() => mutation.build()) as never);
});

afterEach(() => jest.useRealTimers());

function setup() {
  return renderHook(() => useFixedIncomeContributionViewModel());
}

it("SHOULD not save without an amount AND flag it", () => {
  const { result } = setup();

  act(() => result.current.onSave());

  expect(result.current.amountError).toBe(true);
  expect(mutation.value.mutate).not.toHaveBeenCalled();
});

it("SHOULD save the contribution with its date AND the first account", () => {
  const { result } = setup();

  act(() => result.current.onAmountChange(500000));
  act(() => result.current.onDateChange(new Date(2026, 9, 20, 12)));
  act(() => result.current.onSave());

  expect(mutation.value.mutate).toHaveBeenCalledWith({
    accountId: "acc-1",
    amount: 500000,
    assetId: "asset-fi",
    date: "2026-10-20",
    generateTransaction: true,
  });
});

it("SHOULD leave the account out WHEN no finance entry is generated AND take the picked account otherwise", () => {
  const { result } = setup();

  act(() => result.current.onAmountChange(500000));
  act(() => result.current.onAccountChange("acc-2"));
  act(() => result.current.onSave());

  expect(mutation.value.mutate).toHaveBeenLastCalledWith(
    expect.objectContaining({ accountId: "acc-2" }),
  );

  act(() => result.current.onGenerateChange(false));
  act(() => result.current.onSave());

  expect(mutation.value.mutate).toHaveBeenLastCalledWith(
    expect.objectContaining({
      accountId: undefined,
      generateTransaction: false,
    }),
  );
});

it("SHOULD invalidate AND close after saving, show the failure otherwise", () => {
  mutation.withStatus("success");
  setup();

  expect(invalidateInvestments).toHaveBeenCalled();
  expect(modalNavigation.closeModal).toHaveBeenCalled();

  mutation.reset().withError(new InvestmentArchived());

  expect(setup().result.current.failure?.key).toBe(
    "investment.errors.archived",
  );
});

it("SHOULD expose the loading AND not found states", () => {
  detailQuery.reset().withIsFetching(true);

  expect(setup().result.current.isLoading).toBe(true);

  detailQuery.reset().withError();

  expect(setup().result.current.isNotFound).toBe(true);
});
