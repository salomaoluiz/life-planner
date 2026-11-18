import { act, renderHook } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";

import { modalNavigation } from "@tests/modalNavigation";

import { StockLotDTO } from "@application/dto/stock/StockDTO";
import { useCases } from "@application/useCases";
import {
  StockLotAlreadyOpen,
  StockNotEnoughQuantity,
} from "@domain/entities/errors";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { StockLotStatus } from "@domain/entities/stock/StockLotEntity";
import { QuantityMode } from "@domain/entities/stock/stockQuantity";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import { dto } from "@screens/Stock/models/stockUi.fixtures";

import useStockMovementViewModel from "./useStockMovementViewModel";

jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/i18n/useTranslationLocale", () => ({
  __esModule: true,
  default: () => ({ getLocale: () => ({ languageTag: "en-US" }) }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    createStockMovementUseCase: { execute: jest.fn(), uniqueName: "movement" },
    getStockItemUseCase: { execute: jest.fn(), uniqueName: "get_item" },
    getStockMovementsUseCase: {
      execute: jest.fn(),
      uniqueName: "get_movements",
    },
  },
}));

function lot(id: string, quantity: number, extra: Partial<StockLotDTO> = {}) {
  return {
    expirationStatus: StockLotStatus.OK,
    id,
    quantity,
    ...extra,
  } as StockLotDTO;
}
const item = dto((f) =>
  f
    .withId("item-1")
    .withUnit(StockUnits.KILOGRAM)
    .withLots([
      lot("expired", 2, { expirationStatus: StockLotStatus.EXPIRED }),
      lot("closed", 3),
    ]),
);
const itemQuery = new UseQueryFixture<typeof item>();
const mutationFixture = new UseMutationFixture<unknown, unknown>();
let mutation = mutationFixture.reset().build();

function setup(
  params: Record<string, string | undefined> = {},
  options: {
    data?: typeof item | undefined;
    error?: boolean;
    mutation?: ReturnType<typeof mutationFixture.build>;
  } = {},
) {
  itemQuery.reset();
  if (options.data !== undefined || !options.error)
    itemQuery.withData(options.data ?? item);
  if (options.error) itemQuery.withError();
  mutation = options.mutation ?? mutationFixture.reset().build();
  jest.mocked(useQuery).mockReturnValue(itemQuery.build() as never);
  jest.mocked(useMutation).mockReturnValue(mutation as never);
  jest.mocked(useLocalSearchParams).mockReturnValue({
    itemId: "item-1",
    ownerId: "owner-1",
    type: "ENTRY",
    ...params,
  } as never);

  return renderHook(() => useStockMovementViewModel());
}

function type(value: string, lotId?: string) {
  return setup({ lotId, type: value });
}
function typed(text: string, mode = QuantityMode.SMALL) {
  return { mode, text };
}

beforeEach(() => jest.clearAllMocks());

describe("defaults", () => {
  it("SHOULD start an OPEN at 1 kg with the automatic lot, and an entry empty with the purchase reason", () => {
    const open = type("OPEN").result.current;

    expect(open.input).toEqual({ mode: QuantityMode.LARGE, text: "1" });
    expect(open.chosenLot).toBe("");
    expect(open.openPreview?.opened.text).toBe("1");
    expect(type("ENTRY").result.current.input?.text).toBe("");
    expect(type("ENTRY").result.current.chosenReason).toBe("PURCHASE");
  });

  it("SHOULD start a DISCARD at the whole lot with EXPIRED for an expired lot and OTHER otherwise", () => {
    const expired = type("DISCARD", "expired").result.current;
    const closed = type("DISCARD", "closed").result.current;

    expect(expired.input).toEqual({ mode: QuantityMode.LARGE, text: "2" });
    expect(expired.chosenLot).toBe("expired");
    expect(expired.chosenReason).toBe("EXPIRED");
    expect(closed.chosenReason).toBe("OTHER");
  });

  it("SHOULD use the lot of a shortcut AND default to ENTRY WHEN the type is missing", () => {
    expect(type("CONSUME", "closed").result.current.chosenLot).toBe("closed");
    expect(setup({ type: undefined }).result.current.type).toBe("ENTRY");
  });

  it("SHOULD be loading without the item AND report a load error", () => {
    itemQuery.reset().withIsFetching(true);
    jest.mocked(useQuery).mockReturnValue(itemQuery.build() as never);
    jest.mocked(useMutation).mockReturnValue(mutation as never);
    jest.mocked(useLocalSearchParams).mockReturnValue({
      itemId: "item-1",
      ownerId: "o",
      type: "ENTRY",
    } as never);

    const loading = renderHook(() => useStockMovementViewModel()).result
      .current;

    expect(loading.isLoading).toBe(true);
    expect(loading.model).toBeUndefined();
    expect(setup({}, { error: true }).result.current.loadErrorKey).toBe(
      "stock.movement.loadError",
    );
  });
});

describe("saving", () => {
  it("SHOULD record an entry with its dates, reason and note", () => {
    const { result } = setup();

    act(() => result.current.onQuantityChange(typed("1500")));
    act(() => result.current.onReasonChange("MANUAL"));
    act(() => result.current.setExpirationDate(new Date(2026, 11, 1)));
    act(() => result.current.setPurchaseDate(new Date(2026, 10, 9)));
    act(() => result.current.onNoteChange(" bought "));
    act(() => result.current.onSave());

    expect(mutation.mutate).toHaveBeenCalledWith({
      countedQuantity: undefined,
      expirationDate: new Date(2026, 11, 1),
      itemId: "item-1",
      lotId: undefined,
      note: "bought",
      ownerId: "owner-1",
      purchaseDate: new Date(2026, 10, 9),
      quantity: 1.5,
      reason: "MANUAL",
      type: "ENTRY",
    });
  });

  it("SHOULD send the counted quantity of an adjust (0 allowed) and the chosen lot of a consume", () => {
    const adjust = type("ADJUST");

    act(() => adjust.result.current.onQuantityChange(typed("0")));
    act(() => adjust.result.current.onSave());
    expect(mutation.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        countedQuantity: 0,
        quantity: undefined,
        reason: undefined,
      }),
    );

    const consume = type("CONSUME");

    act(() => consume.result.current.onLotChange("closed"));
    act(() => consume.result.current.onQuantityChange(typed("250")));
    act(() => consume.result.current.onSave());
    expect(mutation.mutate).toHaveBeenLastCalledWith(
      expect.objectContaining({ lotId: "closed", quantity: 0.25 }),
    );
  });

  it("SHOULD refuse an empty or zero quantity (except adjust) and show the error", () => {
    const { result } = setup();

    act(() => result.current.onSave());
    expect(mutation.mutate).not.toHaveBeenCalled();
    expect(result.current.quantityError).toBe("stock.movement.errors.invalid");

    act(() => result.current.onQuantityChange(typed("0")));
    act(() => result.current.onSave());
    expect(mutation.mutate).not.toHaveBeenCalled();
  });

  it("SHOULD not save without the item or while saving", () => {
    mutation = mutationFixture.reset().withIsFetching(true).build();
    const saving = setup({}, { mutation });

    act(() => saving.result.current.onQuantityChange(typed("1")));
    act(() => saving.result.current.onSave());
    expect(mutation.mutate).not.toHaveBeenCalled();
    expect(saving.result.current.isSaving).toBe(true);

    itemQuery.reset();
    jest.mocked(useQuery).mockReturnValue(itemQuery.build() as never);
    const none = renderHook(() => useStockMovementViewModel());

    act(() => none.result.current.onSave());
    expect(mutation.mutate).not.toHaveBeenCalled();
  });

  it("SHOULD close and refresh the item and the history after success", () => {
    setup(
      {},
      { mutation: mutationFixture.reset().withStatus("success").build() },
    );

    expect(invalidateFetcherData).toHaveBeenCalledWith(["get_item"]);
    expect(invalidateFetcherData).toHaveBeenCalledWith(["get_movements"]);
    expect(modalNavigation.closeModal).toHaveBeenCalled();
  });
});

describe("errors", () => {
  it.each([
    [new StockNotEnoughQuantity(), "stock.movement.errors.notEnough"],
    [new StockLotAlreadyOpen(), "stock.movement.errors.alreadyOpen"],
    [new Error("x"), "common.errors.generic"],
  ])("SHOULD explain %p", (error, key) => {
    const { result } = setup(
      {},
      {
        mutation: {
          ...mutationFixture.reset().withStatus("error").build(),
          error,
        } as never,
      },
    );

    expect(result.current.errorKey).toBe(key);
  });

  it("SHOULD have no error otherwise AND close and retry", async () => {
    const { result } = setup();

    expect(result.current.errorKey).toBeUndefined();

    act(() => result.current.onClose());
    await act(async () => result.current.onRetry());

    expect(modalNavigation.closeModal).toHaveBeenCalled();
    expect(useCases.getStockItemUseCase.execute).not.toHaveBeenCalled();
  });
});

it("SHOULD read the item of the route", async () => {
  setup();

  const props = jest.mocked(useQuery).mock.calls[0][0];

  await props.fetch();

  expect(useCases.getStockItemUseCase.execute).toHaveBeenCalledWith({
    id: "item-1",
  });
});
