import { useIsFocused } from "@react-navigation/native";
import { act, renderHook } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import { modalNavigation } from "@tests/modalNavigation";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { GenericError } from "@domain/entities/errors";
import {
  ShoppingListDetailEntity,
  ShoppingListRowOrigins,
  ShoppingListStatuses,
} from "@domain/entities/stock/ShoppingListEntity";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useQuery } from "@infrastructure/fetcher";
import useOwners from "@presentation/hooks/useOwners";

import useStockListDetailViewModel, {
  ADD_AS_TEXT_ID,
} from "./useStockListDetailViewModel";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/hooks/useOwners");
jest.mock("@presentation/i18n", () => ({
  useTranslationLocale: () => ({ getLocale: () => ({ languageTag: "en-US" }) }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    addShoppingListRowUseCase: { execute: jest.fn(), uniqueName: "add" },
    deleteShoppingListRowUseCase: { execute: jest.fn(), uniqueName: "delete" },
    getListPurchasesUseCase: { execute: jest.fn(), uniqueName: "purchases" },
    getShoppingListUseCase: { execute: jest.fn(), uniqueName: "detail" },
    suggestStockItemsUseCase: { execute: jest.fn(), uniqueName: "suggest" },
    updateShoppingListRowUseCase: { execute: jest.fn(), uniqueName: "update" },
  },
}));

const owners = [
  new OwnerDTO({ id: "u", name: "Ana", type: OwnerType.USER }),
  new OwnerDTO({ id: "f", name: "Casa", type: OwnerType.FAMILY }),
  new OwnerDTO({
    archived: true,
    id: "x",
    name: "Old",
    type: OwnerType.FAMILY,
  }),
];
const rows = [
  {
    description: "Milk",
    id: "r1",
    itemId: "i1",
    origin: ShoppingListRowOrigins.AUTO,
    priceSource: "MANUAL" as const,
    quantity: 6,
    stock: { minQuantity: 3, quantity: 2 },
    unit: StockUnits.UNIT,
    unitPriceCents: 489,
  },
  {
    description: "Candle",
    id: "r2",
    origin: ShoppingListRowOrigins.MANUAL,
    priceSource: "NONE" as const,
    quantity: 1,
    unit: StockUnits.UNIT,
  },
];
function detail(ownerId = "f"): ShoppingListDetailEntity {
  return {
    groups: [{ rows, subtotalCents: 0, unpricedCount: 1 }],
    list: {
      currency: "BRL",
      id: "l",
      isDefault: true,
      name: "Mercado",
      owner: "FAMILY",
      ownerId,
      status: ShoppingListStatuses.ACTIVE,
    },
    totals: {
      autoCount: 1,
      estimatedTotalCents: 0,
      pricedCount: 0,
      rowCount: 2,
    },
  };
}
const queries: Record<string, Record<string, unknown>> = {};
const refetch = jest.fn();
const fetchers: Record<string, () => Promise<unknown>> = {};

function setup(ownerId = "f") {
  queries.detail = { data: detail(ownerId), refetch };
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: "l" });
  jest.mocked(useOwners).mockReturnValue({ data: owners } as never);
  jest.mocked(useQuery).mockImplementation(((props: {
    cacheKey: string[];
    fetch: () => Promise<unknown>;
  }) => {
    fetchers[props.cacheKey[0]] = props.fetch;

    return {
      data: undefined,
      error: null,
      isFetching: false,
      refetch,
      ...queries[props.cacheKey[0]],
    };
  }) as never);

  return renderHook(() => useStockListDetailViewModel());
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.mocked(useIsFocused).mockReturnValue(true);
  Object.keys(queries).forEach((key) => delete queries[key]);
});

afterEach(() => {
  jest.useRealTimers();
});

it("SHOULD build the model, the owner name and refetch on focus", async () => {
  const { result } = setup();

  expect(result.current.model?.rows).toHaveLength(2);
  expect(result.current.ownerName).toBe("Casa");
  expect(result.current.currency).toBe("BRL");
  expect(result.current.readOnly).toBe(false);
  expect(refetch).toHaveBeenCalled();

  await fetchers.detail();
  expect(useCases.getShoppingListUseCase.execute).toHaveBeenCalledWith({
    id: "l",
  });
});

it("SHOULD be read-only on a list of an archived family and refuse to open a row", () => {
  const { result } = setup("x");

  expect(result.current.readOnly).toBe(true);
  act(() => result.current.onRowPress("r1"));
  expect(result.current.selectedRow).toBeUndefined();
});

it("SHOULD report loading, not found and a load error", () => {
  queries.detail = { data: undefined, isFetching: true };
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: "l" });
  jest.mocked(useOwners).mockReturnValue({ data: owners } as never);
  jest.mocked(useQuery).mockImplementation(((props: {
    cacheKey: string[];
  }) => ({
    data: undefined,
    error: null,
    isFetching: false,
    refetch,
    ...queries[props.cacheKey[0]],
  })) as never);
  expect(
    renderHook(() => useStockListDetailViewModel()).result.current.isLoading,
  ).toBe(true);

  const notFound = new GenericError();

  notFound.addContext({ error: { statusCode: 404 } });
  queries.detail = { data: undefined, error: notFound };
  const missing = renderHook(() => useStockListDetailViewModel()).result
    .current;

  expect(missing.isNotFound).toBe(true);
  expect(missing.errorMessageKey).toBeUndefined();

  queries.detail = { data: undefined, error: new Error("boom") };
  expect(
    renderHook(() => useStockListDetailViewModel()).result.current
      .errorMessageKey,
  ).toBe("stock.lists.errorLoad");
});

it("SHOULD suggest stock items from 2 characters (debounced) plus the add-as-text entry", () => {
  queries.suggest = {
    data: [{ brand: "B", description: "Pão de queijo", id: "i9" }],
  };
  const { result } = setup();

  act(() => result.current.onSearchChange("pão"));
  act(() => {
    jest.advanceTimersByTime(300);
  });

  expect(result.current.addSuggestions.map((s) => s.id)).toEqual([
    "i9",
    ADD_AS_TEXT_ID,
  ]);

  act(() => result.current.onSearchChange(""));
  act(() => {
    jest.advanceTimersByTime(300);
  });
  expect(result.current.addSuggestions).toEqual([]);
});

it("SHOULD add an item (merge notice when summed) and a text row, then clear the field", async () => {
  jest
    .mocked(useCases.addShoppingListRowUseCase.execute)
    .mockResolvedValueOnce({
      merged: true,
      row: { quantity: 12, unit: StockUnits.UNIT },
    } as never)
    .mockResolvedValueOnce({ merged: false, row: {} } as never);
  const { result } = setup();

  await act(async () => result.current.onSelectSuggestion("i1", "Milk"));
  expect(useCases.addShoppingListRowUseCase.execute).toHaveBeenCalledWith({
    itemId: "i1",
    listId: "l",
    quantity: 1,
  });
  expect(result.current.mergedMessage).toEqual({
    list: "Mercado",
    quantity: 12,
    unit: "unit",
  });

  await act(async () =>
    result.current.onSelectSuggestion(ADD_AS_TEXT_ID, " Vela "),
  );
  expect(useCases.addShoppingListRowUseCase.execute).toHaveBeenLastCalledWith({
    description: "Vela",
    listId: "l",
    quantity: 1,
    unit: "unit",
  });
  expect(result.current.mergedMessage).toBeUndefined();

  await act(async () =>
    result.current.onSelectSuggestion(ADD_AS_TEXT_ID, "  "),
  );
  expect(useCases.addShoppingListRowUseCase.execute).toHaveBeenCalledTimes(2);
});

it("SHOULD remove a row, say it comes back for an item below its minimum, and undo with its origin", async () => {
  const { result } = setup();

  await act(async () => result.current.onRemove(rows[0] as never));
  expect(useCases.deleteShoppingListRowUseCase.execute).toHaveBeenCalledWith({
    rowId: "r1",
  });
  expect(result.current.removed).toEqual({ comesBack: true, name: "Milk" });

  await act(async () => result.current.onUndo());
  expect(useCases.addShoppingListRowUseCase.execute).toHaveBeenLastCalledWith({
    itemId: "i1",
    listId: "l",
    origin: "AUTO",
    quantity: 6,
    restore: true,
  });
  expect(result.current.removed).toBeUndefined();
});

it("SHOULD undo a text row by creating it again with its price", async () => {
  const { result } = setup();

  await act(async () => result.current.onRemove(rows[1] as never));
  expect(result.current.removed?.comesBack).toBe(false);

  await act(async () => result.current.onUndo());
  expect(useCases.addShoppingListRowUseCase.execute).toHaveBeenLastCalledWith({
    description: "Candle",
    estimatedUnitPriceCents: undefined,
    listId: "l",
    quantity: 1,
    unit: "unit",
  });

  await act(async () => result.current.onUndo());
  expect(useCases.addShoppingListRowUseCase.execute).toHaveBeenCalledTimes(1);
});

it("SHOULD edit a row: load its values, save the quantity and the price, and refuse a bad quantity", async () => {
  const { result } = setup();

  act(() => result.current.onRowPress("r1"));
  expect(result.current.selectedRow?.id).toBe("r1");
  expect(result.current.quantity.text).toBe("6");
  expect(result.current.priceCents).toBe(489);

  act(() =>
    result.current.onQuantityChange({ ...result.current.quantity, text: "8" }),
  );
  act(() => result.current.onPriceChange(500));
  await act(async () => result.current.onRowSave());
  expect(useCases.updateShoppingListRowUseCase.execute).toHaveBeenCalledWith({
    description: undefined,
    estimatedUnitPriceCents: 500,
    id: "r1",
    quantity: 8,
  });

  act(() => result.current.onRowPress("r2"));
  act(() => result.current.onDescriptionChange("Big candle"));
  act(() => result.current.onPriceChange(0));
  await act(async () => result.current.onRowSave());
  expect(
    useCases.updateShoppingListRowUseCase.execute,
  ).toHaveBeenLastCalledWith({
    description: "Big candle",
    estimatedUnitPriceCents: null,
    id: "r2",
    quantity: 1,
  });

  act(() => result.current.onRowPress("r1"));
  act(() =>
    result.current.onQuantityChange({ ...result.current.quantity, text: "" }),
  );
  await act(async () => result.current.onRowSave());
  expect(result.current.failed).toBe(true);
  act(() => result.current.onFailedHide());
  expect(result.current.failed).toBe(false);
  act(() => result.current.onRowClose());
});

it("SHOULD flag a failed write and keep going", async () => {
  jest
    .mocked(useCases.deleteShoppingListRowUseCase.execute)
    .mockRejectedValueOnce(new Error("boom"));
  const { result } = setup();

  await act(async () => result.current.onRemove(rows[0] as never));

  expect(result.current.failed).toBe(true);
  expect(result.current.removed).toBeUndefined();
});

it("SHOULD navigate back to the lists, open the edit modal and clear notices", async () => {
  const { result } = setup();

  act(() => result.current.onBack());
  expect(router.replace).toHaveBeenCalledWith("/stock/lists");

  act(() => result.current.onEditList());
  expect(modalNavigation.openModal).toHaveBeenCalledWith(
    "stock_shopping_list",
    { id: "l" },
  );

  act(() => result.current.onMergedHide());
  act(() => result.current.onNoticeHide());
  await act(async () => result.current.onRetry());
  expect(refetch).toHaveBeenCalled();
});

describe("purchases (spec 120)", () => {
  it("SHOULD list the open purchases of the list AND open the start modal or a purchase", () => {
    queries.purchases = {
      data: {
        items: [
          {
            cart: { count: 4, totalCents: 0, unpricedCount: 0 },
            purchase: { id: "p1", status: "OPEN" },
          },
          { id: "closed", status: "CLOSED" },
        ],
      },
      refetch,
    };

    const { result } = setup();

    expect(result.current.openPurchases).toEqual([
      { cartCount: 4, id: "p1", status: "OPEN" },
    ]);

    result.current.onGoShopping();
    expect(modalNavigation.openModal).toHaveBeenCalledWith(
      "stock_start_purchase",
      { id: "l" },
    );
    result.current.onOpenPurchase("p1");
    expect(router.push).toHaveBeenCalledWith("/stock/purchases/p1");
  });
});
