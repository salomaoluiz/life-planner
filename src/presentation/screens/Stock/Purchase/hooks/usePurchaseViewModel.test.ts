import { useIsFocused } from "@react-navigation/native";
import { act, renderHook } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AppState } from "react-native";

import { useCases } from "@application/useCases";
import {
  ApiBusinessError,
  ConnectivityError,
  GenericError,
} from "@domain/entities/errors";
import {
  PurchaseRowStates,
  PurchaseStatuses,
} from "@domain/entities/stock/PurchaseEntity";
import { ShoppingListRowOrigins } from "@domain/entities/stock/ShoppingListEntity";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { useQuery } from "@infrastructure/fetcher";
import { purchaseQueue } from "@infrastructure/offlineQueue";
import { subscribeToEvents } from "@infrastructure/sse";

import usePurchaseViewModel, { parseExpiration } from "./usePurchaseViewModel";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@infrastructure/sse", () => ({ subscribeToEvents: jest.fn() }));
jest.mock("@presentation/i18n", () => ({
  useTranslationLocale: () => ({ getLocale: () => ({ languageTag: "en-US" }) }),
}));
jest.mock("@infrastructure/uuid", () => {
  let counter = 0;

  return { uuidv4: () => `uuid-${(counter += 1)}` };
});
jest.mock("@application/useCases", () => ({
  useCases: {
    changePurchaseStatusUseCase: { execute: jest.fn(), uniqueName: "change" },
    deletePurchaseRowUseCase: { execute: jest.fn(), uniqueName: "delete" },
    getPurchaseUseCase: { execute: jest.fn(), uniqueName: "purchase" },
    getShoppingListUseCase: { execute: jest.fn(), uniqueName: "detail" },
    upsertPurchaseRowUseCase: { execute: jest.fn(), uniqueName: "upsert" },
  },
}));
jest.mock("@infrastructure/offlineQueue", () => {
  let snapshot: unknown[] = [];
  const listeners = new Set<() => void>();

  function notify() {
    listeners.forEach((listener) => listener());
  }

  return {
    purchaseQueue: {
      enqueue: jest.fn((entry: unknown) => {
        snapshot = [...snapshot, entry];
        notify();
      }),
      flush: jest.fn().mockResolvedValue({ dropped: [], sent: [] }),
      getSnapshot: () => snapshot,
      list: () => snapshot,
      reset: () => {
        snapshot = [];
        notify();
      },
      subscribe: (listener: () => void) => {
        listeners.add(listener);

        return () => listeners.delete(listener);
      },
    },
  };
});

const refetch = jest.fn();
const queries: Record<string, Record<string, unknown>> = {};

function detail() {
  return {
    groups: [
      {
        category: { id: "c", name: "Dairy", path: "Dairy" },
        rows: [
          {
            description: "Milk",
            id: "l-milk",
            origin: ShoppingListRowOrigins.MANUAL,
            priceSource: "MANUAL",
            quantity: 6,
            unit: StockUnits.UNIT,
            unitPriceCents: 489,
          },
          {
            description: "Rice",
            id: "l-rice",
            origin: ShoppingListRowOrigins.MANUAL,
            priceSource: "NONE",
            quantity: 1,
            unit: StockUnits.UNIT,
          },
        ],
        subtotalCents: 0,
        unpricedCount: 0,
      },
    ],
    list: { currency: "BRL", id: "l1" },
    totals: {},
  };
}
function executeUpsert() {
  return jest.mocked(useCases.upsertPurchaseRowUseCase.execute);
}

function noop() {
  return undefined;
}

function purchaseView(extra: Record<string, unknown> = {}) {
  return {
    cart: { count: 1, totalCents: 500, unpricedCount: 0 },
    forecastCents: 900,
    otherCarts: [],
    purchase: {
      currency: "BRL",
      id: "p1",
      lastActivityAt: "2026-11-18T10:00:00.000Z",
      listId: "l1",
      marketId: "m1",
      purchaseDate: "2026-11-18",
      status: PurchaseStatuses.OPEN,
    },
    remaining: { count: 2, estimatedCents: 400, pricedCount: 1 },
    rows: [
      {
        checkedAt: "2026-11-18T10:00:00.000Z",
        description: "Rice",
        id: "r1",
        lineTotalCents: 500,
        listRowId: "l-rice",
        quantity: 1,
        state: PurchaseRowStates.IN_CART,
        unit: StockUnits.UNIT,
        unknownPrice: false,
      },
    ],
    ...extra,
  };
}

function setup() {
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: "p1" });
  jest.mocked(useQuery).mockImplementation(((props: {
    cacheKey: string[];
  }) => ({
    data: undefined,
    error: null,
    isFetching: false,
    refetch,
    ...queries[props.cacheKey[0]],
  })) as never);

  return renderHook(() => usePurchaseViewModel());
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  (purchaseQueue as unknown as { reset: () => void }).reset();
  Object.keys(queries).forEach((key) => delete queries[key]);
  queries.purchase = { data: purchaseView(), refetch };
  queries.detail = { data: detail(), refetch };
  jest.mocked(useIsFocused).mockReturnValue(true);
  jest.mocked(subscribeToEvents).mockReturnValue(jest.fn());
  jest.mocked(purchaseQueue.flush).mockResolvedValue({ dropped: [], sent: [] });
});
afterEach(() => jest.useRealTimers());

describe("parseExpiration", () => {
  it("SHOULD read dd/mm/yyyy AND mm/yyyy, clear on blank AND refuse nonsense", () => {
    expect(parseExpiration("31/03/2027")).toBe("2027-03-31");
    expect(parseExpiration("03/2027")).toBe("2027-03-01");
    expect(parseExpiration("  ")).toBeNull();
    expect(parseExpiration("32/01/2027")).toBeUndefined();
    expect(parseExpiration("1/13/2027")).toBeUndefined();
    expect(parseExpiration("abc")).toBeUndefined();
  });
});

describe("model", () => {
  it("SHOULD split the list into to-buy and the cart AND filter by the search text", () => {
    const { result } = setup();

    expect(result.current.visibleToBuy.map((row) => row.id)).toEqual([
      "l-milk",
    ]);
    expect(result.current.cartCount).toBe(1);
    expect(result.current.isOpen).toBe(true);
    expect(result.current.currency).toBe("BRL");

    act(() => result.current.onSearchChange("zzz"));
    expect(result.current.visibleToBuy).toEqual([]);
    act(() => result.current.onSearchChange("mil"));
    expect(result.current.visibleToBuy).toHaveLength(1);
  });

  it("SHOULD answer a load error without data", () => {
    queries.purchase = { data: undefined, error: new GenericError(), refetch };

    const { result } = setup();

    expect(result.current.errorMessageKey).toBe("stock.purchase.errorLoad");
  });
});

describe("ticking a row", () => {
  it("SHOULD open the sheet with the list quantity AND save it online with the unit price", async () => {
    executeUpsert().mockResolvedValue({
      convertedToOutside: false,
      row: { description: "Milk" },
    } as never);

    const { result } = setup();

    act(() => result.current.onTick(result.current.visibleToBuy[0]));
    expect(result.current.sheet).toMatchObject({
      description: "Milk",
      listRowId: "l-milk",
      quantity: "6",
    });

    act(() => result.current.onSheetChange({ priceCents: 489 }));
    await act(async () => result.current.onSheetSave());

    expect(executeUpsert()).toHaveBeenCalledWith(
      expect.objectContaining({
        listRowId: "l-milk",
        purchaseId: "p1",
        quantity: 6,
        state: PurchaseRowStates.IN_CART,
        unitPriceCents: 489,
      }),
    );
    expect(result.current.sheet).toBeUndefined();
    expect(refetch).toHaveBeenCalled();
  });

  it("SHOULD send the line total WHEN that price type is chosen AND the expiration WHEN typed", async () => {
    executeUpsert().mockResolvedValue({
      convertedToOutside: false,
      row: {},
    } as never);

    const { result } = setup();

    act(() => result.current.onTick(result.current.visibleToBuy[0]));
    act(() =>
      result.current.onSheetChange({
        expiration: "03/2027",
        priceCents: 3000,
        priceInput: "LINE",
      }),
    );
    await act(async () => result.current.onSheetSave());

    expect(executeUpsert()).toHaveBeenCalledWith(
      expect.objectContaining({
        expirationDate: "2027-03-01",
        lineTotalCents: 3000,
        priceInput: "LINE",
      }),
    );
  });

  it("SHOULD not open the sheet for a row in another cart", () => {
    const { result } = setup();

    act(() =>
      result.current.onTick({
        ...result.current.visibleToBuy[0],
        otherCart: { marketName: "Atacadão", userName: "Ana" },
      }),
    );

    expect(result.current.sheet).toBeUndefined();
  });

  it("SHOULD tell the user WHEN the row ended up outside the list (FR 18)", async () => {
    executeUpsert().mockResolvedValue({
      conflict: { purchaseId: "p2", userName: "Ana" },
      convertedToOutside: true,
      row: { description: "Milk" },
    } as never);

    const { result } = setup();

    act(() => result.current.onTick(result.current.visibleToBuy[0]));
    await act(async () => result.current.onSheetSave());

    expect(result.current.notice).toBe("Milk|Ana");
    act(() => result.current.onNoticeHide());
    expect(result.current.notice).toBeUndefined();
  });

  it("SHOULD queue the write WHEN offline AND show it as pending", async () => {
    executeUpsert().mockRejectedValue(new ConnectivityError());

    const { result } = setup();

    act(() => result.current.onTick(result.current.visibleToBuy[0]));
    await act(async () => result.current.onSheetSave());

    expect(purchaseQueue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "PURCHASE_ROW", ownerId: "p1" }),
    );
    expect(result.current.offlineCount).toBe(1);
    expect(result.current.model?.cart.some((row) => row.pending)).toBe(true);
  });

  it("SHOULD keep the order WHEN something is already queued (no direct send)", async () => {
    executeUpsert().mockRejectedValueOnce(new ConnectivityError());

    const { result } = setup();

    act(() => result.current.onTick(result.current.visibleToBuy[0]));
    await act(async () => result.current.onSheetSave());
    executeUpsert().mockClear();

    act(() => result.current.onAddOutside());
    act(() => result.current.onSearchChange("Candle"));
    act(() => result.current.onAddOutside());
    await act(async () => result.current.onSheetSave());

    expect(executeUpsert()).not.toHaveBeenCalled();
    expect(purchaseQueue.enqueue).toHaveBeenCalledTimes(2);
  });

  it("SHOULD flag the failure WHEN the API refuses the row (no queue)", async () => {
    executeUpsert().mockRejectedValue(
      Object.assign(new GenericError(), {
        context: { error: new ApiBusinessError("no", 422) },
      }),
    );

    const { result } = setup();

    act(() => result.current.onTick(result.current.visibleToBuy[0]));
    await act(async () => result.current.onSheetSave());

    expect(result.current.failed).toBe(true);
    expect(purchaseQueue.enqueue).not.toHaveBeenCalled();
    act(() => result.current.onFailedHide());
    expect(result.current.failed).toBe(false);
  });
});

describe("outside the list AND not found", () => {
  it("SHOULD add an item typed in the search as a text row (min 2 letters)", async () => {
    executeUpsert().mockResolvedValue({
      convertedToOutside: false,
      row: {},
    } as never);

    const { result } = setup();

    act(() => result.current.onSearchChange("a"));
    act(() => result.current.onAddOutside());
    expect(result.current.sheet).toBeUndefined();

    act(() => result.current.onSearchChange("Candle"));
    act(() => result.current.onAddOutside());
    expect(result.current.sheet).toMatchObject({
      description: "Candle",
      isNew: true,
    });
    expect(result.current.search).toBe("");

    await act(async () => result.current.onSheetSave());
    expect(executeUpsert()).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Candle", unit: StockUnits.UNIT }),
    );
  });

  it("SHOULD mark a row as not found from the list AND from the sheet, AND undo it", async () => {
    executeUpsert().mockResolvedValue({
      convertedToOutside: false,
      row: {},
    } as never);

    const { result } = setup();
    const row = result.current.visibleToBuy[0];

    await act(async () => result.current.onNotFound(row));
    expect(executeUpsert()).toHaveBeenCalledWith(
      expect.objectContaining({
        listRowId: "l-milk",
        state: PurchaseRowStates.NOT_FOUND,
      }),
    );

    act(() => result.current.onTick(row));
    await act(async () => result.current.onSheetNotFound());
    expect(executeUpsert()).toHaveBeenCalledTimes(2);

    await act(async () => result.current.onUndoNotFound(row));
    expect(useCases.deletePurchaseRowUseCase.execute).not.toHaveBeenCalled();
    await act(async () =>
      result.current.onUndoNotFound({ ...row, purchaseRowId: "pr1" }),
    );
    expect(useCases.deletePurchaseRowUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ purchaseId: "p1", rowId: "pr1" }),
    );
  });

  it("SHOULD edit AND remove a cart row from the sheet", async () => {
    const { result } = setup();

    act(() => result.current.onCartRowPress(result.current.model!.cart[0]));
    expect(result.current.sheet).toMatchObject({ isNew: false, rowId: "r1" });

    await act(async () => result.current.onSheetRemove());
    expect(useCases.deletePurchaseRowUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ rowId: "r1" }),
    );
    act(() => result.current.onSheetClose());
  });
});

describe("status", () => {
  it("SHOULD end the purchase AND queue the end WHEN offline", async () => {
    jest
      .mocked(useCases.changePurchaseStatusUseCase.execute)
      .mockRejectedValueOnce(new ConnectivityError());

    const { result } = setup();

    await act(async () => result.current.onEnd());

    expect(purchaseQueue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "PURCHASE_END" }),
    );
    expect(result.current.isEnded).toBe(true);
  });

  it("SHOULD reopen an ended purchase AND go to the closing wizard", async () => {
    queries.purchase = {
      data: purchaseView({
        purchase: {
          ...purchaseView().purchase,
          status: PurchaseStatuses.ENDED,
        },
      }),
      refetch,
    };

    const { result } = setup();

    await act(async () => result.current.onReopen());
    expect(useCases.changePurchaseStatusUseCase.execute).toHaveBeenCalledWith({
      action: "REOPEN",
      id: "p1",
    });

    act(() => result.current.onClose());
    expect(router.push).toHaveBeenCalledWith("/stock/purchases/p1/close");
  });

  it("SHOULD ask before discarding a purchase with items AND discard at once without", async () => {
    const { result } = setup();

    act(() => result.current.onDiscardAsk());
    expect(result.current.confirmDiscard).toBe(true);
    act(() => result.current.onDiscardCancel());
    expect(result.current.confirmDiscard).toBe(false);

    await act(async () => result.current.onDiscard());
    expect(useCases.changePurchaseStatusUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ action: "DISCARD" }),
    );
    expect(router.replace).toHaveBeenCalledWith("/stock/list/l1");
  });

  it("SHOULD discard without asking WHEN the cart is empty", async () => {
    queries.purchase = { data: purchaseView({ rows: [] }), refetch };

    const { result } = setup();

    await act(async () => result.current.onDiscardAsk());
    expect(useCases.changePurchaseStatusUseCase.execute).toHaveBeenCalled();
  });

  it("SHOULD go back to the list", () => {
    const { result } = setup();

    result.current.onBack();
    expect(router.replace).toHaveBeenCalledWith("/stock/list/l1");
  });
});

describe("queue AND events", () => {
  it("SHOULD flush the queue WHEN focused AND process each kind", async () => {
    jest.mocked(purchaseQueue.flush).mockImplementation(async (processor) => {
      const base = {
        clientId: "c",
        createdAt: 1,
        itemName: "x",
        ownerId: "p1",
      };

      for (const entry of [
        {
          ...base,
          itemId: "r1",
          kind: "PURCHASE_ROW",
          payload: { quantity: 2 },
        },
        { ...base, itemId: "r1", kind: "PURCHASE_ROW_DELETE", payload: {} },
        { ...base, itemId: "p1", kind: "PURCHASE_END", payload: {} },
        { ...base, itemId: "p1", kind: "PURCHASE_DISCARD", payload: {} },
      ] as never[]) {
        await processor(entry);
      }

      return { dropped: [{ entry: {}, reason: "x" }], sent: [{}] } as never;
    });
    // The queue must not be empty for the flush to run.
    purchaseQueue.enqueue({
      clientId: "c0",
      createdAt: 0,
      itemId: "r0",
      itemName: "x",
      kind: "PURCHASE_ROW",
      ownerId: "other",
      payload: {},
    });

    const { result } = setup();

    await act(async () => undefined);

    expect(executeUpsert()).toHaveBeenCalledWith(
      expect.objectContaining({ clientId: "c", rowId: "r1" }),
    );
    expect(useCases.deletePurchaseRowUseCase.execute).toHaveBeenCalled();
    expect(useCases.changePurchaseStatusUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ action: "END" }),
    );
    expect(useCases.changePurchaseStatusUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ action: "DISCARD" }),
    );
    expect(result.current.failed).toBe(true);
  });

  it("SHOULD stop the flush at the first offline entry AND drop a refused one", async () => {
    purchaseQueue.enqueue({
      clientId: "c0",
      createdAt: 0,
      itemId: "r0",
      itemName: "x",
      kind: "PURCHASE_ROW",
      ownerId: "other",
      payload: {},
    });

    const outcomes: unknown[] = [];

    jest.mocked(purchaseQueue.flush).mockImplementation(async (processor) => {
      const entry = {
        clientId: "c",
        createdAt: 1,
        itemId: "r1",
        itemName: "x",
        kind: "PURCHASE_ROW",
        ownerId: "p1",
        payload: {},
      } as never;

      executeUpsert().mockRejectedValueOnce(new ConnectivityError());
      outcomes.push(await processor(entry));
      executeUpsert().mockRejectedValueOnce(
        Object.assign(new GenericError(), {
          context: { error: new ApiBusinessError("no", 409) },
        }),
      );
      outcomes.push(await processor(entry));

      return { dropped: [], sent: [] };
    });

    setup();
    await act(async () => undefined);

    expect(outcomes).toEqual([
      { status: "OFFLINE" },
      { reason: "stock.offline.reasonRejected", status: "DROPPED" },
    ]);
  });

  it("SHOULD follow the events of the list AND refetch (debounced) on each one, flush when connected", async () => {
    const { unmount } = setup();

    expect(subscribeToEvents).toHaveBeenCalledWith(
      expect.objectContaining({ path: "/v1/stock/shopping-lists/l1/events" }),
    );

    const options = jest.mocked(subscribeToEvents).mock.calls[0][0];

    refetch.mockClear();
    options.onMessage({ data: "{}", event: "row.upserted" });
    options.onMessage({ data: "{}", event: "row.upserted" });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(refetch).toHaveBeenCalledTimes(2);

    options.onResync();
    options.onStatus?.("CONNECTED");
    options.onStatus?.("DROPPED");
    unmount();
  });

  it("SHOULD not subscribe WHEN the screen is not focused", () => {
    jest.mocked(useIsFocused).mockReturnValue(false);
    setup();

    expect(subscribeToEvents).not.toHaveBeenCalled();
  });

  it("SHOULD flush AND refetch WHEN the app returns to the foreground", async () => {
    let listener: (state: string) => void = noop;

    jest.spyOn(AppState, "addEventListener").mockImplementation(((
      _: string,
      handler: (state: string) => void,
    ) => {
      listener = handler;

      return { remove: jest.fn() };
    }) as never);

    setup();
    refetch.mockClear();
    listener("active");

    expect(refetch).toHaveBeenCalled();
  });
});
