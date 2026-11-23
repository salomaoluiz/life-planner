import { act, renderHook } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import { modalNavigation } from "@tests/modalNavigation";

import { useCases } from "@application/useCases";
import { invalidateFetcherData, useQuery } from "@infrastructure/fetcher";

import useStartPurchaseViewModel, {
  todayIso,
} from "./useStartPurchaseViewModel";

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher");
jest.mock("@infrastructure/uuid", () => ({ uuidv4: () => "new-purchase" }));
jest.mock("@application/useCases", () => ({
  useCases: {
    createMarketUseCase: { execute: jest.fn(), uniqueName: "createMarket" },
    getListPurchasesUseCase: { execute: jest.fn(), uniqueName: "purchases" },
    getMarketsUseCase: { execute: jest.fn(), uniqueName: "markets" },
    getShoppingListUseCase: { execute: jest.fn(), uniqueName: "detail" },
    startPurchaseUseCase: { execute: jest.fn(), uniqueName: "start" },
  },
}));

const closeModal = modalNavigation.closeModal;
const queries: Record<string, Record<string, unknown>> = {};

function setup() {
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: "l1" });
  jest.mocked(useQuery).mockImplementation(((props: {
    cacheKey: string[];
  }) => ({
    data: undefined,
    isFetching: false,
    ...queries[props.cacheKey[0]],
  })) as never);

  return renderHook(() => useStartPurchaseViewModel());
}

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(queries).forEach((key) => delete queries[key]);
  queries.detail = {
    data: {
      list: {
        defaultMarketId: "m2",
        id: "l1",
        name: "Mercado",
        owner: "USER",
        ownerId: "u",
      },
    },
  };
  queries.markets = {
    data: [
      { id: "m1", name: "Bom Preço", neighborhood: "Centro", ownerId: "u" },
      { id: "m2", name: "Atacadão", ownerId: "u" },
      { id: "m3", name: "Other owner", ownerId: "x" },
    ],
  };
  queries.purchases = {
    data: {
      items: [
        {
          cart: { count: 3, totalCents: 0, unpricedCount: 0 },
          purchase: { id: "p9", marketId: "m1" },
          rows: [{ checkedBy: { name: "Ana" } }],
        },
        { id: "closed" },
      ],
    },
  };
  jest
    .mocked(useCases.startPurchaseUseCase.execute)
    .mockResolvedValue({ id: "new-purchase" } as never);
});

it("SHOULD format today as the local calendar day", () => {
  expect(todayIso(new Date(2026, 10, 5))).toBe("2026-11-05");
});

it("SHOULD preselect the default market of the list AND offer only the owner's markets", () => {
  const { result } = setup();

  expect(result.current.selectedMarketId).toBe("m2");
  expect(result.current.marketOptions.map((option) => option.value)).toEqual([
    "m1",
    "m2",
    "__new__",
  ]);
  expect(result.current.marketOptions[0].label).toBe("Bom Preço · Centro");
  expect(result.current.listName).toBe("Mercado");
  expect(result.current.open).toEqual([
    expect.objectContaining({
      cartCount: 3,
      id: "p9",
      marketName: "Bom Preço",
      startedBy: "Ana",
    }),
  ]);
});

it("SHOULD start a purchase with the chosen market AND open it", async () => {
  const { result } = setup();

  act(() => result.current.onMarketChange("m1"));
  await act(async () => result.current.onStart());

  expect(useCases.startPurchaseUseCase.execute).toHaveBeenCalledWith(
    expect.objectContaining({
      id: "new-purchase",
      listId: "l1",
      marketId: "m1",
    }),
  );
  expect(invalidateFetcherData).toHaveBeenCalled();
  expect(closeModal).toHaveBeenCalled();
  expect(router.push).toHaveBeenCalledWith("/stock/purchases/new-purchase");
});

it("SHOULD register a new market first WHEN none is chosen (name required)", async () => {
  queries.markets = { data: [] };
  queries.detail = {
    data: { list: { id: "l1", name: "Mercado", owner: "USER", ownerId: "u" } },
  };
  jest
    .mocked(useCases.createMarketUseCase.execute)
    .mockResolvedValue({ id: "m-new" } as never);

  const { result } = setup();

  expect(result.current.creatingMarket).toBe(true);
  await act(async () => result.current.onStart());
  expect(useCases.createMarketUseCase.execute).not.toHaveBeenCalled();

  act(() => result.current.onNameChange("  Mercado Novo "));
  act(() => result.current.onNeighborhoodChange("Centro"));
  await act(async () => result.current.onStart());

  expect(useCases.createMarketUseCase.execute).toHaveBeenCalledWith({
    name: "Mercado Novo",
    neighborhood: "Centro",
    owner: "USER",
    ownerId: "u",
  });
  expect(useCases.startPurchaseUseCase.execute).toHaveBeenCalledWith(
    expect.objectContaining({ marketId: "m-new" }),
  );
});

it("SHOULD flag the failure AND stay open WHEN the purchase cannot be created", async () => {
  jest
    .mocked(useCases.startPurchaseUseCase.execute)
    .mockRejectedValue(new Error("down"));

  const { result } = setup();

  await act(async () => result.current.onStart());

  expect(result.current.failed).toBe(true);
  expect(result.current.saving).toBe(false);
  expect(closeModal).not.toHaveBeenCalled();
});

it("SHOULD join an open purchase", () => {
  const { result } = setup();

  act(() => result.current.onJoin({ id: "p9" } as never));

  expect(router.push).toHaveBeenCalledWith("/stock/purchases/p9");
  act(() => result.current.onClose());
  expect(closeModal).toHaveBeenCalled();
});
