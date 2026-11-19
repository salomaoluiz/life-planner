import { act, renderHook } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";

import { modalNavigation } from "@tests/modalNavigation";

import { useCases } from "@application/useCases";
import { ShoppingListStatuses } from "@domain/entities/stock/ShoppingListEntity";
import { invalidateFetcherData, useQuery } from "@infrastructure/fetcher";

import useAddToListViewModel from "./useAddToListViewModel";

jest.mock("expo-router", () => ({ useLocalSearchParams: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/i18n", () => ({
  useTranslationLocale: () => ({ getLocale: () => ({ languageTag: "en-US" }) }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    addShoppingListRowUseCase: { execute: jest.fn(), uniqueName: "add" },
    getShoppingListsUseCase: { execute: jest.fn(), uniqueName: "lists" },
    getShoppingListUseCase: { execute: jest.fn(), uniqueName: "detail" },
    getStockItemUseCase: { execute: jest.fn(), uniqueName: "item" },
  },
}));

function listCard(id: string, extra: Record<string, unknown> = {}) {
  return {
    id,
    isDefault: false,
    name: `List ${id}`,
    ownerId: "o",
    status: ShoppingListStatuses.ACTIVE,
    ...extra,
  };
}
const item = {
  description: "Milk",
  effectiveShoppingListId: "p",
  id: "i",
  idealQuantity: 8,
  ownerId: "o",
  quantity: 2,
  restockQuantity: 6,
  stockOnly: false,
  unit: "unit",
};
const lists = [
  listCard("d", { isDefault: true }),
  listCard("p"),
  listCard("arch", { status: ShoppingListStatuses.ARCHIVED }),
  listCard("other", { ownerId: "z" }),
];
const queries: Record<string, Record<string, unknown>> = {};

function setup(extra: { item?: unknown; target?: unknown } = {}) {
  queries.item = { data: extra.item ?? item };
  queries.lists = { data: lists };
  queries.detail = { data: extra.target };
  jest.mocked(useLocalSearchParams).mockReturnValue({ itemId: "i" });
  jest.mocked(useQuery).mockImplementation(((props: {
    cacheKey: string[];
  }) => ({
    data: undefined,
    isFetching: false,
    ...queries[props.cacheKey[0]],
  })) as never);

  return renderHook(() => useAddToListViewModel());
}

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD offer the active lists of the item owner, start on its effective list with what is missing to the ideal", () => {
  const { result } = setup();

  expect(result.current.listOptions.map((option) => option.value)).toEqual([
    "d",
    "p",
  ]);
  expect(result.current.selectedListId).toBe("p");
  expect(result.current.quantity.text).toBe("6");
  expect(result.current.merge).toBeUndefined();
  expect(result.current.notOffered).toBe(false);
});

it("SHOULD fall back to the default list and to 1 without an ideal", () => {
  const { result } = setup({
    item: {
      ...item,
      effectiveShoppingListId: "arch",
      idealQuantity: undefined,
    },
  });

  expect(result.current.selectedListId).toBe("d");
  expect(result.current.quantity.text).toBe("1");
});

it("SHOULD announce the merge WHEN the item is already on the chosen list", () => {
  const { result } = setup({
    target: {
      groups: [{ rows: [{ itemId: "i", quantity: 6 }] }],
    },
  });

  expect(result.current.merge).toEqual({
    list: "List p",
    quantity: "6",
    total: "12",
  });
});

it("SHOULD not offer stock-only items", () => {
  expect(
    setup({ item: { ...item, stockOnly: true } }).result.current.notOffered,
  ).toBe(true);
});

it("SHOULD add the row to the chosen list, refresh the lists and close", async () => {
  const { result } = setup();

  act(() => result.current.onListChange("d"));
  act(() =>
    result.current.onQuantityChange({ ...result.current.quantity, text: "3" }),
  );
  await act(async () => result.current.onSubmit());

  expect(useCases.addShoppingListRowUseCase.execute).toHaveBeenCalledWith({
    itemId: "i",
    listId: "d",
    quantity: 3,
  });
  expect(invalidateFetcherData).toHaveBeenCalledWith(["lists"]);
  expect(modalNavigation.closeModal).toHaveBeenCalled();
});

it("SHOULD flag an invalid quantity or a failed write and keep the sheet open", async () => {
  const { result } = setup();

  act(() =>
    result.current.onQuantityChange({ ...result.current.quantity, text: "" }),
  );
  await act(async () => result.current.onSubmit());
  expect(result.current.failed).toBe(true);
  expect(useCases.addShoppingListRowUseCase.execute).not.toHaveBeenCalled();

  act(() =>
    result.current.onQuantityChange({ ...result.current.quantity, text: "2" }),
  );
  jest
    .mocked(useCases.addShoppingListRowUseCase.execute)
    .mockRejectedValueOnce(new Error("boom"));
  await act(async () => result.current.onSubmit());
  expect(result.current.failed).toBe(true);
  expect(result.current.saving).toBe(false);
  expect(modalNavigation.closeModal).not.toHaveBeenCalled();

  act(() => result.current.onClose());
  expect(modalNavigation.closeModal).toHaveBeenCalled();
});

it("SHOULD run the three reads (item, lists of the owner, the chosen list)", async () => {
  setup();
  const calls = jest.mocked(useQuery).mock.calls.map(([options]) => options);

  for (const options of calls) {
    await options.fetch();
  }

  expect(useCases.getStockItemUseCase.execute).toHaveBeenCalledWith({
    id: "i",
  });
  expect(useCases.getShoppingListsUseCase.execute).toHaveBeenCalledWith({
    ownerId: "o",
  });
  expect(useCases.getShoppingListUseCase.execute).toHaveBeenCalledWith({
    id: "p",
  });
});

it("SHOULD report loading while the item or the lists are fetching", () => {
  queries.item = { data: undefined, isFetching: true };
  jest.mocked(useLocalSearchParams).mockReturnValue({ itemId: "i" });
  jest.mocked(useQuery).mockImplementation(((props: {
    cacheKey: string[];
  }) => ({
    data: undefined,
    isFetching: false,
    ...queries[props.cacheKey[0]],
  })) as never);

  expect(
    renderHook(() => useAddToListViewModel()).result.current.isLoading,
  ).toBe(true);
});
