import { useLocalSearchParams } from "expo-router";

import { act, renderHook } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import { InvestmentNoPosition } from "@domain/entities/errors";
import { InvestmentOperationType } from "@domain/entities/investment/enums";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import {
  makeDetail,
  makeEventOperation,
  makeEventSuggestion,
  makeFractionSale,
  makeOperation,
} from "@screens/Investment/mocks/fixtures";

import useEventFormViewModel from "./useEventFormViewModel";

jest.mock("expo-router", () => ({ useLocalSearchParams: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Investment/hooks/invalidateInvestments");
jest.mock("@application/useCases", () => ({
  useCases: {
    approveInvestmentEventSuggestionUseCase: {
      execute: jest.fn(),
      uniqueName: "approve",
    },
    createInvestmentEventUseCase: { execute: jest.fn(), uniqueName: "create" },
    deleteInvestmentOperationUseCase: {
      execute: jest.fn(),
      uniqueName: "delete",
    },
    getInvestmentEventSuggestionsUseCase: {
      execute: jest.fn(),
      uniqueName: "suggestions",
    },
    rejectInvestmentEventSuggestionUseCase: {
      execute: jest.fn(),
      uniqueName: "reject",
    },
    updateInvestmentOperationUseCase: {
      execute: jest.fn(),
      uniqueName: "update",
    },
  },
}));

const suggestionsQuery = new UseQueryFixture();
const mutations = {
  approve: new UseMutationFixture(),
  create: new UseMutationFixture(),
  delete: new UseMutationFixture(),
  reject: new UseMutationFixture(),
  update: new UseMutationFixture(),
};
const mglu = makeDetail({
  operations: [
    makeOperation({
      date: "2026-01-10",
      id: "buy-1",
      quantity: "3155",
      total: 319100,
    }),
  ],
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date(2026, 10, 11, 12));
  suggestionsQuery.reset().withData([makeEventSuggestion()]);
  Object.values(mutations).forEach((mutation) => mutation.reset());
  jest.mocked(useLocalSearchParams).mockReturnValue({ assetId: "asset-1" });
  jest
    .mocked(useQuery)
    .mockImplementation((() => suggestionsQuery.build()) as never);
  jest
    .mocked(useMutation)
    .mockImplementation(((props: { cacheKey: string[] }) =>
      mutations[props.cacheKey[0] as keyof typeof mutations].build()) as never);
});
afterEach(() => jest.useRealTimers());

function fillReverseSplit(result: {
  current: ReturnType<typeof useEventFormViewModel>;
}) {
  act(() => result.current.onTypeChange(InvestmentOperationType.REVERSE_SPLIT));
  act(() => result.current.onRatioFromChange("10"));
  act(() => result.current.onRatioToChange("1"));
  act(() => result.current.onDateChange(new Date(2026, 2, 10)));
}

function setup(asset = mglu, operation = undefined as never, readOnly = false) {
  return renderHook(() => useEventFormViewModel(asset, operation, readOnly));
}

it("SHOULD start as an empty split dated today AND preview nothing", () => {
  const { result } = setup();

  expect(result.current).toMatchObject({
    isEditing: false,
    isLoading: false,
    isSuggestion: false,
    noPosition: false,
    preview: null,
    saveKey: "investment.event.save",
    titleKey: "investment.form.operation.newTitle",
    type: InvestmentOperationType.SPLIT,
  });
});

it("SHOULD preview the position after a reverse split AND tell the fraction", () => {
  const { result } = setup();

  fillReverseSplit(result);

  expect(result.current.preview?.quantity.after).toBe("315");
  expect(result.current.hasFraction).toBe(true);
  expect(result.current.fractionQuantity).toBe("0.5");
  expect(result.current.newShares).toBe("315");
});

it("SHOULD count only the shares a bonus adds", () => {
  const { result } = setup(
    makeDetail({
      operations: [
        makeOperation({ date: "2026-01-10", quantity: "315", total: 318594 }),
      ],
    }),
  );

  act(() => result.current.onTypeChange(InvestmentOperationType.BONUS));
  act(() => result.current.onBonusPercentChange("10"));
  act(() => result.current.onBonusUnitCostChange("4,5"));

  expect(result.current.newShares).toBe("31");
  expect(result.current.bonusEvery).toBe("10");
  expect(result.current.preview?.quantity.after).toBe("346");
});

it("SHOULD create the event with the typed fields", () => {
  const { result } = setup();

  fillReverseSplit(result);
  act(() => result.current.onSave());

  expect(mutations.create.value.mutate).toHaveBeenCalledWith({
    assetId: "asset-1",
    bonusUnitCost: undefined,
    date: "2026-03-10",
    ratioFrom: "10",
    ratioTo: "1",
    type: "REVERSE_SPLIT",
  });
});

it("SHOULD not save an invalid draft AND show its errors only after the first try", () => {
  const { result } = setup();

  expect(result.current.errors).toEqual({});

  act(() => result.current.onSave());

  expect(mutations.create.value.mutate).not.toHaveBeenCalled();
  expect(result.current.errors.ratioFrom).toBe("investment.event.errors.ratio");
});

it("SHOULD warn that there is no position WHEN the date is before the first buy", () => {
  const { result } = setup();

  fillReverseSplit(result);
  act(() => result.current.onDateChange(new Date(2025, 11, 31)));

  expect(result.current.noPosition).toBe(true);
  expect(result.current.preview).toBeNull();
});

it("SHOULD not save WHEN read-only", () => {
  const { result } = setup(mglu, undefined as never, true);

  fillReverseSplit(result);
  act(() => result.current.onSave());

  expect(mutations.create.value.mutate).not.toHaveBeenCalled();
});

describe("editing an event", () => {
  const event = makeEventOperation();

  beforeEach(() => {
    jest
      .mocked(useLocalSearchParams)
      .mockReturnValue({ assetId: "asset-1", id: "event-1" });
  });

  it("SHOULD open with the event AND save through the operation update", () => {
    const { result } = setup(
      makeDetail({ operations: [event, ...mglu.operations] }),
      event as never,
    );

    expect(result.current).toMatchObject({
      isEditing: true,
      ratioFrom: "10",
      ratioTo: "1",
      titleKey: "investment.form.operation.editTitle",
      type: "REVERSE_SPLIT",
    });

    act(() => result.current.onRatioFromChange("20"));
    act(() => result.current.onSave());

    expect(mutations.update.value.mutate).toHaveBeenCalledWith({
      date: "2026-03-10",
      id: "event-1",
      ratioFrom: "20",
      ratioTo: "1",
    });
  });

  it("SHOULD list the fraction sale AND its finance entry in the delete confirmation", () => {
    const { result } = setup(
      makeDetail({
        operations: [makeFractionSale(), event, ...mglu.operations],
      }),
      event as never,
    );

    expect(result.current.deleteBodyLines.map((line) => line.key)).toEqual([
      "investment.event.deleteFraction",
      "investment.event.deleteEntry",
    ]);
    expect(result.current.deleteType).toBe("REVERSE_SPLIT");

    act(() => result.current.onDeleteOpen());
    expect(result.current.deleteOpen).toBe(true);

    act(() => result.current.onDeleteConfirm());
    expect(mutations.delete.value.mutate).toHaveBeenCalledWith("event-1");
    expect(result.current.deleteOpen).toBe(false);
  });

  it("SHOULD list nothing WHEN there is no sale", () => {
    const { result } = setup(
      makeDetail({ operations: [event, ...mglu.operations] }),
      event as never,
    );

    expect(result.current.deleteBodyLines).toEqual([]);
  });
});

describe("a suggestion", () => {
  beforeEach(() => {
    jest
      .mocked(useLocalSearchParams)
      .mockReturnValue({ assetId: "asset-1", suggestionId: "esug-1" });
  });

  const asset = makeDetail({
    operations: [
      makeOperation({ date: "2026-01-10", quantity: "315", total: 318594 }),
    ],
  });

  it("SHOULD open prefilled AND approve with the values on screen", () => {
    const { result } = setup(asset);

    expect(result.current).toMatchObject({
      bonusPercent: "10",
      bonusUnitCost: "4.5",
      isSuggestion: true,
      saveKey: "investment.event.approve",
      titleKey: "investment.event.approveTitle",
      type: "BONUS",
    });

    act(() => result.current.onBonusPercentChange("5"));
    act(() => result.current.onSave());

    expect(mutations.approve.value.mutate).toHaveBeenCalledWith({
      bonusPercent: "5",
      bonusUnitCost: "4.5",
      date: "2026-11-18",
      id: "esug-1",
      type: "BONUS",
    });
  });

  it("SHOULD reject it", () => {
    const { result } = setup(asset);

    act(() => result.current.onReject());

    expect(mutations.reject.value.mutate).toHaveBeenCalledWith("esug-1");
  });

  it("SHOULD be loading until the suggestion arrives", () => {
    suggestionsQuery.reset();

    expect(setup(asset).result.current.isLoading).toBe(true);
  });
});

it("SHOULD ask before discarding a changed form, not an untouched one", () => {
  const { result } = setup();

  act(() => result.current.onClose());
  expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);

  act(() => result.current.onRatioFromChange("1"));
  act(() => result.current.onClose());
  expect(result.current.discardOpen).toBe(true);

  act(() => result.current.onDiscardCancel());
  expect(result.current.discardOpen).toBe(false);

  act(() => result.current.onDiscardConfirm());
  expect(modalNavigation.closeModal).toHaveBeenCalledTimes(2);
});

it("SHOULD refresh the investments AND close WHEN a write succeeds", () => {
  mutations.create.value.status = "success";

  setup();

  expect(invalidateInvestments).toHaveBeenCalled();
  expect(modalNavigation.closeModal).toHaveBeenCalled();
});

it("SHOULD expose the 422 of the event rules", () => {
  mutations.create.reset().withError(new InvestmentNoPosition("2026-03-10"));

  const { result } = setup();

  expect(result.current.failure?.key).toBe("investment.event.noPosition");
});
