import { act, renderHook } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";

import { modalNavigation } from "@tests/modalNavigation";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import { useBreakpoint } from "@presentation/theme";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";
import { dto } from "@screens/Stock/models/stockUi.fixtures";

import useNewStockItemViewModel from "./useNewStockItemViewModel";

jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Financial/hooks/useActiveOwners");
jest.mock("@presentation/i18n/useTranslationLocale", () => ({
  __esModule: true,
  default: () => ({ getLocale: () => ({ languageTag: "en-US" }) }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    createStockItemUseCase: { execute: jest.fn(), uniqueName: "create_stock" },
    getOwnerChangePreviewUseCase: { execute: jest.fn(), uniqueName: "preview" },
    getStockCategoriesUseCase: { execute: jest.fn(), uniqueName: "categories" },
    getStockItemUseCase: { execute: jest.fn(), uniqueName: "get_item" },
    getStockLocationsUseCase: { execute: jest.fn(), uniqueName: "locations" },
    suggestStockItemsUseCase: { execute: jest.fn(), uniqueName: "suggest" },
    updateStockItemUseCase: { execute: jest.fn(), uniqueName: "update_stock" },
  },
}));

const owners = [
  new OwnerDTO({ id: "user-id", name: "Ana", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-id", name: "Silva", type: OwnerType.FAMILY }),
];
const stored = dto((f) =>
  f.withId("item-1").withDescription("Cheese").withUnit(StockUnits.KILOGRAM),
);
const createMutation = new UseMutationFixture<unknown, void>();
const updateMutation = new UseMutationFixture<unknown, void>();
let create = createMutation.reset().build();
let update = updateMutation.reset().build();
const queries: Record<string, unknown> = {};

function setup(
  options: {
    fetching?: boolean;
    itemId?: string;
    noOwners?: boolean;
    ownerId?: string;
    saveFetching?: boolean;
    status?: "error" | "idle" | "success";
  } = {},
) {
  create = createMutation
    .reset()
    .withStatus(options.itemId ? "idle" : (options.status ?? "idle"))
    .withIsFetching(!!options.saveFetching && !options.itemId)
    .build();
  update = updateMutation
    .reset()
    .withStatus(options.itemId ? (options.status ?? "idle") : "idle")
    .withIsFetching(!!options.saveFetching && !!options.itemId)
    .build();
  jest.mocked(useActiveOwners).mockReturnValue({
    data: options.noOwners ? undefined : owners,
    isFetching: !!options.fetching,
  } as never);
  jest
    .mocked(useMutation)
    .mockImplementation(
      ((props: { cacheKey: string[] }) =>
        (props.cacheKey[0] === "update_stock"
          ? update
          : create) as never) as never,
    );
  jest.mocked(useQuery).mockImplementation(
    ((props: { cacheKey: string[]; enabled?: boolean }) =>
      ({
        data: undefined,
        isFetching: false,
        ...((queries[props.cacheKey[0]] as object) ?? {}),
      }) as never) as never,
  );
  jest.mocked(useLocalSearchParams).mockReturnValue({
    itemId: options.itemId,
    ownerId: options.ownerId,
  } as never);

  return renderHook(() => useNewStockItemViewModel());
}

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(queries).forEach((key) => delete queries[key]);
  jest.mocked(useBreakpoint).mockReturnValue("compact");
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

describe("create", () => {
  it("SHOULD be loading while the owners fetch AND build the model with the owner of the param", () => {
    expect(
      setup({ fetching: true, noOwners: true }).result.current.isLoading,
    ).toBe(true);

    const { result } = setup({ ownerId: "family-id" });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.model?.defaultOwnerId).toBe("family-id");
    expect(result.current.values.ownerId).toBe("family-id");
    expect(result.current.isEdit).toBe(false);
  });

  it("SHOULD start with the extra fields open only on wide screens", () => {
    expect(setup().result.current.isMoreOpen).toBe(false);

    jest.mocked(useBreakpoint).mockReturnValue("expanded");
    const wide = setup();

    expect(wide.result.current.isMoreOpen).toBe(true);

    act(() => wide.result.current.onToggleMore());
    expect(wide.result.current.isMoreOpen).toBe(false);
  });

  it("SHOULD create the item WHEN valid AND close the modal after success, refreshing the detail", () => {
    const { result } = setup();

    act(() => result.current.setField("description", "Milk"));
    act(() => result.current.onSave());

    expect(create.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Milk",
        ownerId: "user-id",
        quantity: 0,
      }),
    );

    setup({ status: "success" });

    expect(invalidateFetcherData).toHaveBeenCalledWith(["get_item"]);
    expect(modalNavigation.closeModal).toHaveBeenCalled();
  });

  it("SHOULD not create WHEN invalid, while saving or without owners", () => {
    const invalid = setup();

    act(() => invalid.result.current.onSave());
    expect(create.mutate).not.toHaveBeenCalled();
    expect(invalid.result.current.errors.description).toBeDefined();

    const saving = setup({ saveFetching: true });

    act(() => saving.result.current.setField("description", "x"));
    act(() => saving.result.current.onSave());
    expect(create.mutate).not.toHaveBeenCalled();

    const none = setup({ noOwners: true });

    act(() => none.result.current.onSave());
    expect(create.mutate).not.toHaveBeenCalled();
  });

  it("SHOULD expose the generic error WHEN saving fails", () => {
    expect(setup({ status: "error" }).result.current.formErrorKey).toBe(
      "common.errors.generic",
    );
  });

  it("SHOULD ask before discarding a dirty form", () => {
    const clean = setup();

    act(() => clean.result.current.onClose());
    expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);

    const dirty = setup();

    act(() => dirty.result.current.setField("description", "x"));
    act(() => dirty.result.current.onClose());
    expect(dirty.result.current.isDiscardOpen).toBe(true);

    act(() => dirty.result.current.onKeepEditing());
    expect(dirty.result.current.isDiscardOpen).toBe(false);

    act(() => dirty.result.current.onDiscard());
    expect(modalNavigation.closeModal).toHaveBeenCalledTimes(2);
  });
});

describe("catalog, suggestions and owner", () => {
  it("SHOULD flatten the active categories and locations of the owner", () => {
    queries.categories = { data: undefined };
    const { result } = setup();

    expect(result.current.catalog).toBeUndefined();
  });

  it("SHOULD clear the category and location WHEN the owner changes", () => {
    const { result } = setup();

    act(() => result.current.setField("categoryId", "c"));
    act(() => result.current.setField("locationId", "l"));
    act(() => result.current.onOwnerChange("family-id"));

    expect(result.current.values).toMatchObject({
      categoryId: undefined,
      locationId: undefined,
      ownerId: "family-id",
    });
  });

  it("SHOULD debounce the typed name AND offer the first suggestion, adding to it through the entry modal", () => {
    queries.suggest = {
      data: [
        { description: "Cheese", id: "s1", quantity: 0.25, unit: "kilogram" },
      ],
    };
    const { result } = setup();

    act(() => result.current.setField("description", "che"));
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.suggestion).toEqual({
      name: "Cheese",
      quantity: { text: "250", unitKey: "common.units.gram" },
    });

    act(() => result.current.onAddToSuggestion());

    expect(modalNavigation.replaceModal).toHaveBeenCalledWith(
      "stock_movement",
      { itemId: "s1", ownerId: "user-id", type: "ENTRY" },
    );
  });

  it("SHOULD have no suggestion to add to WHEN there is none", () => {
    const { result } = setup();

    act(() => result.current.onAddToSuggestion());

    expect(result.current.suggestion).toBeUndefined();
    expect(modalNavigation.replaceModal).not.toHaveBeenCalled();
  });
});

describe("edit", () => {
  it("SHOULD load the item, fill the form AND update it keeping the owner", () => {
    queries.get_item = { data: stored };
    const { result } = setup({ itemId: "item-1" });

    expect(result.current.isEdit).toBe(true);
    expect(result.current.values.description).toBe("Cheese");

    act(() => result.current.setField("description", "Cheese 2"));
    act(() => result.current.onSave());

    expect(update.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Cheese 2",
        id: "item-1",
        ownerId: undefined,
        previousOwnerId: stored.ownerId,
      }),
    );
  });

  it("SHOULD be loading while the item loads AND show the owner change preview WHEN the owner moves", () => {
    queries.get_item = { data: undefined, isFetching: true };
    expect(setup({ itemId: "item-1" }).result.current.isLoading).toBe(true);

    queries.get_item = { data: stored };
    queries.preview = { data: { category: { from: "Dairy" }, location: {} } };
    const { result } = setup({ itemId: "item-1" });

    expect(result.current.ownerChangePreview).toBeUndefined();

    act(() => result.current.onOwnerChange("family-id"));

    expect(result.current.ownerChangePreview).toEqual({
      category: { from: "Dairy" },
      location: {},
    });
  });

  it("SHOULD save through the update use case AND close after success", () => {
    queries.get_item = { data: stored };
    setup({ itemId: "item-1", status: "success" });

    expect(modalNavigation.closeModal).toHaveBeenCalled();
  });
});

describe("query functions", () => {
  function fetcher(name: string) {
    const props = jest
      .mocked(useQuery)
      .mock.calls.map((call) => call[0])
      .find((call) => call.cacheKey[0] === name);

    return props?.fetch as () => Promise<unknown>;
  }

  it("SHOULD read the active categories (with their path) and locations of the owner", async () => {
    jest.mocked(useCases.getStockCategoriesUseCase.execute).mockResolvedValue([
      {
        children: [
          {
            children: [],
            id: "c",
            itemCount: 0,
            name: "Cheese",
            status: "ACTIVE",
          },
        ],
        id: "p",
        itemCount: 0,
        name: "Dairy",
        status: "ACTIVE",
      },
      { children: [], id: "x", itemCount: 0, name: "Old", status: "ARCHIVED" },
    ] as never);
    jest.mocked(useCases.getStockLocationsUseCase.execute).mockResolvedValue([
      { id: "l", itemCount: 0, name: "Pantry", status: "ACTIVE" },
      { id: "z", itemCount: 0, name: "Old", status: "ARCHIVED" },
    ] as never);
    setup();

    expect(await fetcher("categories")()).toEqual({
      categories: [
        { label: "Dairy", value: "p" },
        { label: "Dairy › Cheese", value: "c" },
      ],
      locations: [{ label: "Pantry", value: "l" }],
    });
    expect(useCases.getStockCategoriesUseCase.execute).toHaveBeenCalledWith({
      owner: "USER",
      ownerId: "user-id",
    });
  });

  it("SHOULD read the item, the suggestions and the owner change preview", async () => {
    setup({ itemId: "item-1" });

    await fetcher("get_item")();
    await fetcher("suggest")();
    await fetcher("preview")();

    expect(useCases.getStockItemUseCase.execute).toHaveBeenCalledWith({
      id: "item-1",
    });
    expect(useCases.suggestStockItemsUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ owner: "USER", ownerId: "user-id" }),
    );
    expect(useCases.getOwnerChangePreviewUseCase.execute).toHaveBeenCalledWith({
      itemId: "item-1",
      owner: "USER",
      ownerId: "user-id",
    });
  });
});
