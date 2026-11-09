import { useLocalSearchParams } from "expo-router";

import { act, renderHook } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import { InvestmentArchived } from "@domain/entities/errors";
import { InvestmentAssetDetail } from "@domain/entities/investment/InvestmentEntities";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { makeDetail } from "@screens/Investment/mocks/fixtures";

import useValuationModalViewModel from "./useValuationModalViewModel";

jest.mock("expo-router", () => ({ useLocalSearchParams: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Investment/hooks/invalidateInvestments");
jest.mock("@application/useCases", () => ({
  useCases: {
    getInvestmentAssetUseCase: { execute: jest.fn(), uniqueName: "get" },
    upsertInvestmentValuationUseCase: {
      execute: jest.fn(),
      uniqueName: "upsert",
    },
  },
}));

const detailQuery = new UseQueryFixture<InvestmentAssetDetail>();
const mutation = new UseMutationFixture();

beforeEach(() => {
  jest.clearAllMocks();
  detailQuery.reset().withData(makeDetail());
  mutation.reset();
  jest.mocked(useLocalSearchParams).mockReturnValue({ assetId: "asset-1" });
  jest
    .mocked(useQuery)
    .mockImplementation((() => detailQuery.build()) as never);
  jest
    .mocked(useMutation)
    .mockImplementation((() => mutation.build()) as never);
});

function setup() {
  return renderHook(() => useValuationModalViewModel());
}

it("SHOULD not save an invalid price AND flag it after the first attempt", () => {
  const { result } = setup();

  expect(result.current.unitPriceError).toBeUndefined();
  act(() => result.current.onSave());

  expect(result.current.unitPriceError).toBe(
    "investment.form.operation.unitPriceInvalid",
  );
  expect(mutation.value.mutate).not.toHaveBeenCalled();
});

it("SHOULD show the position line AND save the local day of the date", () => {
  const { result } = setup();

  act(() => result.current.onUnitPriceChange("10,61"));
  act(() => result.current.onDateChange(new Date(2026, 10, 4)));
  act(() => result.current.onSave());

  expect(result.current.positionText).toEqual({
    price: "R$10.61",
    quantity: "1,200",
    value: "R$12,732.00",
  });
  expect(mutation.value.mutate).toHaveBeenCalledWith({
    assetId: "asset-1",
    date: "2026-11-04",
    unitPrice: "10,61",
  });
});

it("SHOULD keep the date WHEN the picker clears it", () => {
  const { result } = setup();
  const before = result.current.date;

  act(() => result.current.onDateChange(undefined));

  expect(result.current.date).toBe(before);
});

it("SHOULD close and invalidate WHEN the save succeeds", () => {
  mutation.withStatus("success");

  setup();

  expect(invalidateInvestments).toHaveBeenCalled();
  expect(modalNavigation.closeModal).toHaveBeenCalled();
});

it("SHOULD expose the failure, the loading and not found states", () => {
  mutation.withError(new InvestmentArchived() as never);
  expect(setup().result.current.failure?.key).toBe(
    "investment.errors.archived",
  );

  detailQuery.reset().withIsFetching(true);
  expect(setup().result.current.isLoading).toBe(true);

  detailQuery.reset().withError();
  expect(setup().result.current.isNotFound).toBe(true);
});
