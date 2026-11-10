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

import useFixedIncomeAdjustViewModel from "./useFixedIncomeAdjustViewModel";

jest.mock("expo-router", () => ({ useLocalSearchParams: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Investment/hooks/invalidateInvestments");
jest.mock("@application/useCases", () => ({
  useCases: {
    getInvestmentAssetUseCase: { execute: jest.fn(), uniqueName: "get" },
    upsertInvestmentFixedIncomeAdjustmentUseCase: {
      execute: jest.fn(),
      uniqueName: "adjust",
    },
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
  return renderHook(() => useFixedIncomeAdjustViewModel());
}

it("SHOULD compare the statement with the gross of today", () => {
  const { result } = setup();

  expect(result.current.computed).toBe(1631066);
  expect(result.current.difference).toBeNull();

  act(() => result.current.onGrossChange(1627490));

  expect(result.current.difference).toBe(1627490 - 1631066);
  expect(result.current.differencePercent).toBeCloseTo(-0.0022, 4);
});

it("SHOULD show no comparison for another date", () => {
  const { result } = setup();

  act(() => result.current.onGrossChange(1627490));
  act(() => result.current.onDateChange(new Date(2026, 9, 31, 12)));

  expect(result.current.dateText).toBe("2026-10-31");
  expect(result.current.computed).toBeNull();
  expect(result.current.difference).toBeNull();
  expect(result.current.differencePercent).toBeNull();
});

it("SHOULD not save without the statement value AND flag it, then save with the date", () => {
  const { result } = setup();

  act(() => result.current.onSave());

  expect(result.current.grossError).toBe(true);
  expect(mutation.value.mutate).not.toHaveBeenCalled();

  act(() => result.current.onGrossChange(1627490));
  act(() => result.current.onSave());

  expect(mutation.value.mutate).toHaveBeenCalledWith({
    assetId: "asset-fi",
    date: "2026-11-04",
    grossAmount: 1627490,
  });
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
