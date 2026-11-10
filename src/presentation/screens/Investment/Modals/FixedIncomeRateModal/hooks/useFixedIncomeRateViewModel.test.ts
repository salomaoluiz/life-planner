import { useLocalSearchParams } from "expo-router";

import { act, renderHook } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import { InvestmentArchived } from "@domain/entities/errors";
import { InvestmentFixedIncomeRateMode } from "@domain/entities/investment/enums";
import { InvestmentAssetDetail } from "@domain/entities/investment/InvestmentEntities";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { makeFixedIncomeDetail } from "@screens/Investment/mocks/fixtures";

import useFixedIncomeRateViewModel from "./useFixedIncomeRateViewModel";

jest.mock("expo-router", () => ({ useLocalSearchParams: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Investment/hooks/invalidateInvestments");
jest.mock("@application/useCases", () => ({
  useCases: {
    createInvestmentFixedIncomeRateUseCase: {
      execute: jest.fn(),
      uniqueName: "create",
    },
    getInvestmentAssetUseCase: { execute: jest.fn(), uniqueName: "get" },
    updateInvestmentFixedIncomeRateUseCase: {
      execute: jest.fn(),
      uniqueName: "update",
    },
  },
}));

const detailQuery = new UseQueryFixture<InvestmentAssetDetail>();
const createMutation = new UseMutationFixture();
const updateMutation = new UseMutationFixture();

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date(2026, 10, 4, 12));
  detailQuery.reset().withData(makeFixedIncomeDetail());
  createMutation.reset();
  updateMutation.reset();
  jest.mocked(useLocalSearchParams).mockReturnValue({ assetId: "asset-fi" });
  jest
    .mocked(useQuery)
    .mockImplementation((() => detailQuery.build()) as never);
  jest
    .mocked(useMutation)
    .mockImplementation(((props: { cacheKey: string[] }) =>
      (props.cacheKey[0] === "update"
        ? updateMutation
        : createMutation
      ).build()) as never);
});

afterEach(() => jest.useRealTimers());

function setup() {
  return renderHook(() => useFixedIncomeRateViewModel());
}

it("SHOULD pre-fill the mode AND the percentages of the latest entry (update rate)", () => {
  const { result } = setup();

  expect(result.current.isEditing).toBe(false);
  expect(result.current.form).toMatchObject({
    cdiPercent: "110.0000",
    indexRate: "14.9000",
    mode: InvestmentFixedIncomeRateMode.CDI_PERCENT,
  });
  expect(result.current.startText).toBe("2026-11-04");
  expect(result.current.history.map((rate) => rate.id)).toEqual(["rate-1"]);
});

it("SHOULD add an entry with the new index AND the chosen date", () => {
  const { result } = setup();

  act(() =>
    result.current.onFormChange({ ...result.current.form, indexRate: "15,2" }),
  );
  act(() => result.current.onStartDateChange(new Date(2026, 11, 1, 12)));
  act(() => result.current.onSave());

  expect(createMutation.value.mutate).toHaveBeenCalledWith({
    assetId: "asset-fi",
    rate: expect.objectContaining({
      indexRate: "15,2",
      mode: "CDI_PERCENT",
      startDate: "2026-12-01",
    }),
  });
});

it("SHOULD not save an invalid rate AND flag it", () => {
  const { result } = setup();

  act(() =>
    result.current.onFormChange({ ...result.current.form, cdiPercent: "" }),
  );
  act(() => result.current.onSave());

  expect(result.current.invalid).toBe(true);
  expect(createMutation.value.mutate).not.toHaveBeenCalled();
});

it("SHOULD edit the entry named by the route AND keep its date", () => {
  jest
    .mocked(useLocalSearchParams)
    .mockReturnValue({ assetId: "asset-fi", rateId: "rate-1" });

  const { result } = setup();

  expect(result.current.isEditing).toBe(true);
  expect(result.current.startText).toBe("2026-01-15");
  expect(result.current.history).toEqual([]);

  act(() => result.current.onSave());

  expect(updateMutation.value.mutate).toHaveBeenCalledWith({
    id: "rate-1",
    rate: expect.objectContaining({ startDate: "2026-01-15" }),
  });
});

it("SHOULD report an entry that does not exist as not found", () => {
  jest
    .mocked(useLocalSearchParams)
    .mockReturnValue({ assetId: "asset-fi", rateId: "nope" });

  expect(setup().result.current.isNotFound).toBe(true);
});

it("SHOULD invalidate AND close after saving, show the failure otherwise", () => {
  createMutation.withStatus("success");
  setup();

  expect(invalidateInvestments).toHaveBeenCalled();
  expect(modalNavigation.closeModal).toHaveBeenCalled();

  createMutation.reset().withError(new InvestmentArchived());

  expect(setup().result.current.failure?.key).toBe(
    "investment.errors.archived",
  );
});

it("SHOULD expose the loading state", () => {
  detailQuery.reset().withIsFetching(true);

  expect(setup().result.current.isLoading).toBe(true);
});
