import { useIsFocused } from "@react-navigation/native";
import { act, renderHook } from "@testing-library/react-native";
import { router } from "expo-router";

import { modalNavigation } from "@tests/modalNavigation";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { ShoppingListStatuses } from "@domain/entities/stock/ShoppingListEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";

import useStockListsViewModel, { fetchLists } from "./useStockListsViewModel";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@presentation/hooks/useOwnerScopedQuery");
jest.mock("@application/useCases", () => ({
  useCases: {
    getShoppingListsUseCase: { execute: jest.fn(), uniqueName: "lists" },
    updateShoppingListUseCase: { execute: jest.fn(), uniqueName: "update" },
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
const cards = [
  {
    autoCount: 2,
    currency: "BRL",
    estimatedTotalCents: 100,
    id: "m",
    isDefault: true,
    name: "Mercado",
    owner: "FAMILY",
    ownerId: "f",
    pricedCount: 1,
    rowCount: 3,
    status: ShoppingListStatuses.ACTIVE,
  },
  {
    autoCount: 0,
    currency: "BRL",
    estimatedTotalCents: 0,
    id: "a",
    isDefault: false,
    name: "Old",
    owner: "FAMILY",
    ownerId: "f",
    pricedCount: 0,
    rowCount: 0,
    status: ShoppingListStatuses.ARCHIVED,
  },
];
const refetch = jest.fn();

function setup(query: Record<string, unknown> = { data: { cards, owners } }) {
  jest.mocked(useOwnerScopedQuery).mockReturnValue({
    error: null,
    isFetching: false,
    refetch,
    ...query,
  } as never);

  return renderHook(() => useStockListsViewModel());
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useIsFocused).mockReturnValue(false);
});

it("SHOULD read every list (archived too) with the owners", async () => {
  jest
    .mocked(useCases.getShoppingListsUseCase.execute)
    .mockResolvedValue(cards as never);

  expect(await fetchLists(owners)).toEqual({ cards, owners });
  expect(useCases.getShoppingListsUseCase.execute).toHaveBeenCalledWith({
    includeArchived: true,
  });
});

it("SHOULD split the active and archived cards AND refetch WHEN focused", () => {
  jest.mocked(useIsFocused).mockReturnValue(true);
  const { result } = setup();

  expect(result.current.activeCards.map((card) => card.id)).toEqual(["m"]);
  expect(result.current.archivedCards.map((card) => card.id)).toEqual(["a"]);
  expect(result.current.isEmpty).toBe(false);
  expect(refetch).toHaveBeenCalled();
});

it("SHOULD report loading, an error with nothing to show and an empty state", () => {
  expect(
    setup({ data: undefined, isFetching: true }).result.current.isLoading,
  ).toBe(true);
  expect(
    setup({ data: undefined, error: new Error("x") }).result.current
      .errorMessageKey,
  ).toBe("stock.lists.errorLoad");
  expect(setup({ data: { cards: [], owners } }).result.current.isEmpty).toBe(
    true,
  );
});

it("SHOULD open a list, toggle the archived block, filter and refresh", async () => {
  const { result } = setup();

  act(() => result.current.onCardPress("m"));
  expect(router.push).toHaveBeenCalledWith("/stock/list/m");

  act(() => result.current.onArchivedToggle());
  expect(result.current.archivedOpen).toBe(true);

  act(() => result.current.onFilterChange("f"));
  expect(result.current.filter).toBe("f");

  await act(async () => result.current.onRefresh());
  await act(async () => result.current.onRetry());
  expect(refetch).toHaveBeenCalledTimes(2);
});

it("SHOULD open the new list modal with the family of the chip, or none", () => {
  const { result } = setup();

  act(() => result.current.onNewPress());
  expect(modalNavigation.openModal).toHaveBeenLastCalledWith(
    "stock_shopping_list",
    undefined,
  );

  act(() => result.current.onFilterChange("f"));
  act(() => result.current.onNewPress());
  expect(modalNavigation.openModal).toHaveBeenLastCalledWith(
    "stock_shopping_list",
    { ownerId: "f" },
  );
});

it("SHOULD reactivate a list and refetch, or flag the failure", async () => {
  const { result } = setup();

  await act(async () => result.current.onReactivate("a"));
  expect(useCases.updateShoppingListUseCase.execute).toHaveBeenCalledWith({
    id: "a",
    status: "ACTIVE",
  });
  expect(refetch).toHaveBeenCalled();

  jest
    .mocked(useCases.updateShoppingListUseCase.execute)
    .mockRejectedValueOnce(new Error("boom"));
  await act(async () => result.current.onReactivate("a"));
  expect(result.current.reactivateFailed).toBe(true);

  act(() => result.current.onToastHide());
  expect(result.current.reactivateFailed).toBe(false);
});

it("SHOULD fall back to All WHEN the chosen filter is an archived family", () => {
  const { result } = setup({
    data: {
      cards: [{ ...cards[0], ownerId: "x" }],
      owners,
    },
  });

  act(() => result.current.onFilterChange("x"));
  act(() => result.current.onNewPress());
  expect(result.current.filter).toBe("ALL");
  expect(modalNavigation.openModal).toHaveBeenCalled();
});
