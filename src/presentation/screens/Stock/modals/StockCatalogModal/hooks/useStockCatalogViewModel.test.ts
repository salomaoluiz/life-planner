import { act, renderHook } from "@testing-library/react-native";

import { modalNavigation } from "@tests/modalNavigation";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import {
  StockCategoryInUse,
  StockLocationInUse,
} from "@domain/entities/errors";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";

import useStockCatalogViewModel from "./useStockCatalogViewModel";

jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Financial/hooks/useActiveOwners");
jest.mock("@application/useCases", () => {
  function useCase(name: string) {
    return { execute: jest.fn(), uniqueName: name };
  }

  return {
    useCases: {
      createStockCategorySuggestionsUseCase: useCase("suggest_categories"),
      createStockCategoryUseCase: useCase("create_category"),
      createStockLocationSuggestionsUseCase: useCase("suggest_locations"),
      createStockLocationUseCase: useCase("create_location"),
      deleteStockCategoryUseCase: useCase("delete_category"),
      deleteStockLocationUseCase: useCase("delete_location"),
      getFinancialCategoriesUseCase: useCase("finance_categories"),
      getStockCategoriesUseCase: useCase("categories"),
      getStockLocationsUseCase: useCase("locations"),
      updateStockCategoryUseCase: useCase("update_category"),
      updateStockLocationUseCase: useCase("update_location"),
    },
  };
});

const owners = [
  new OwnerDTO({ id: "user-id", name: "Ana", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-id", name: "Silva", type: OwnerType.FAMILY }),
];
function category(
  id: string,
  name: string,
  extra: Record<string, unknown> = {},
) {
  return { children: [], id, itemCount: 0, name, status: "ACTIVE", ...extra };
}
const catalog = {
  categories: [
    category("dairy", "Dairy", {
      children: [
        category("cheese", "Cheese", {
          effectiveFinanceCategoryId: "fin",
          parentId: "dairy",
        }),
      ],
      financeCategoryId: "fin",
    }),
    category("old", "Old", { status: "ARCHIVED" }),
  ],
  locations: [{ id: "fridge", itemCount: 2, name: "Fridge", status: "ACTIVE" }],
};
const finance = [
  { id: "fin", name: "Groceries", status: "ACTIVE", type: "EXPENSE" },
  { id: "inc", name: "Salary", status: "ACTIVE", type: "INCOME" },
  { id: "arch", name: "Old", status: "ARCHIVED", type: "EXPENSE" },
];

const mutationFixture = new UseMutationFixture<unknown, unknown>();
type UseMutationBuilt = ReturnType<typeof mutationFixture.build>;
let mutations: Record<string, UseMutationBuilt> = {};
const names = [
  "create_category",
  "update_category",
  "delete_category",
  "suggest_categories",
  "create_location",
  "update_location",
  "delete_location",
  "suggest_locations",
];

function setup(
  options: {
    catalogData?: typeof catalog | undefined;
    errors?: Record<string, unknown>;
    ownersData?: OwnerDTO[] | undefined;
    statuses?: Record<string, "error" | "idle" | "success">;
  } = {},
) {
  mutations = Object.fromEntries(
    names.map((name) => [
      name,
      {
        ...mutationFixture
          .reset()
          .withStatus(options.statuses?.[name] ?? "idle")
          .build(),
        error: (options.errors?.[name] ?? null) as never,
        reset: jest.fn(),
      },
    ]),
  );
  jest.mocked(useActiveOwners).mockReturnValue({
    data: "ownersData" in options ? options.ownersData : owners,
    isFetching: false,
  } as never);
  jest
    .mocked(useMutation)
    .mockImplementation(
      ((props: { cacheKey: string[] }) =>
        mutations[props.cacheKey[0]]) as never,
    );
  jest.mocked(useQuery).mockImplementation(((props: { cacheKey: string[] }) => {
    if (props.cacheKey[0] === "categories") {
      return {
        data: "catalogData" in options ? options.catalogData : catalog,
        isFetching: false,
        refetch: jest.fn(),
      };
    }

    return { data: finance, isFetching: false };
  }) as never);

  return renderHook(() => useStockCatalogViewModel());
}

beforeEach(() => jest.clearAllMocks());

describe("rows", () => {
  it("SHOULD flatten the tree with depth, the finance label and 'inherits'", () => {
    const { result } = setup();

    expect(
      result.current.categories.map((row) => [
        row.category.id,
        row.depth,
        row.financeLabel,
        row.inherits,
      ]),
    ).toEqual([
      ["dairy", 0, "Groceries", false],
      ["cheese", 1, undefined, true],
      ["old", 0, undefined, false],
    ]);
    expect(result.current.financeOptions).toEqual([
      { label: "Groceries", value: "fin" },
    ]);
    expect(result.current.locations).toHaveLength(1);
    expect(result.current.isEmptyCategories).toBe(false);
    expect(result.current.isEmptyLocations).toBe(false);
    expect(result.current.owner?.id).toBe("user-id");
    expect(result.current.isLoading).toBe(false);
  });

  it("SHOULD report empty lists WHEN there is nothing yet AND be loading without owners", () => {
    const empty = setup({ catalogData: { categories: [], locations: [] } })
      .result.current;

    expect(empty.isEmptyCategories).toBe(true);
    expect(empty.isEmptyLocations).toBe(true);

    const none = setup({ catalogData: undefined, ownersData: undefined }).result
      .current;

    expect(none.categories).toEqual([]);
    expect(none.locations).toEqual([]);
    expect(none.owner).toBeUndefined();
  });

  it("SHOULD offer the active categories up to depth 2 as parents AND switch owners", async () => {
    const { result } = setup();

    expect(result.current.parentOptions.map((option) => option.value)).toEqual([
      "dairy",
      "cheese",
    ]);

    act(() => result.current.onOwnerChange("family-id"));

    expect(result.current.owner?.id).toBe("family-id");

    const props = jest
      .mocked(useQuery)
      .mock.calls.map((call) => call[0])
      .filter((call) => call.cacheKey[0] === "categories")
      .pop();
    jest
      .mocked(useCases.getStockCategoriesUseCase.execute)
      .mockResolvedValue([]);
    jest
      .mocked(useCases.getStockLocationsUseCase.execute)
      .mockResolvedValue([]);

    await props?.fetch();

    expect(useCases.getStockCategoriesUseCase.execute).toHaveBeenCalledWith({
      includeArchived: true,
      owner: "FAMILY",
      ownerId: "family-id",
    });

    await jest
      .mocked(useQuery)
      .mock.calls.map((call) => call[0])
      .filter((call) => call.cacheKey[0] === "finance_categories")
      .pop()
      ?.fetch();

    expect(useCases.getFinancialCategoriesUseCase.execute).toHaveBeenCalledWith(
      ["family-id"],
    );
  });
});

describe("editor", () => {
  it("SHOULD create a category (with parent and finance mapping) in the owner", () => {
    const { result } = setup();

    act(() => result.current.onAddCategory("dairy"));
    expect(result.current.editor).toEqual({
      kind: "category",
      parentId: "dairy",
    });
    expect(result.current.parentId).toBe("dairy");

    act(() => result.current.onNameChange(" Milk "));
    act(() => result.current.onFinanceChange("fin"));
    act(() => result.current.onSaveEditor());

    expect(mutations.create_category.mutate).toHaveBeenCalledWith({
      financeCategoryId: "fin",
      name: "Milk",
      owner: "USER",
      ownerId: "user-id",
      parentId: "dairy",
    });
  });

  it("SHOULD edit a category, moving it to the top level and clearing its mapping", () => {
    const { result } = setup();

    act(() => result.current.onEditCategory("cheese"));
    expect(result.current.name).toBe("Cheese");
    expect(result.current.parentId).toBe("dairy");

    act(() => result.current.onParentChange(""));
    act(() => result.current.onFinanceChange(""));
    act(() => result.current.onSaveEditor());

    expect(mutations.update_category.mutate).toHaveBeenCalledWith({
      financeCategoryId: null,
      id: "cheese",
      name: "Cheese",
      parentId: null,
    });
  });

  it("SHOULD create and rename locations", () => {
    const { result } = setup();

    act(() => result.current.onAddLocation());
    act(() => result.current.onNameChange("Garage"));
    act(() => result.current.onSaveEditor());
    expect(mutations.create_location.mutate).toHaveBeenCalledWith({
      name: "Garage",
      owner: "USER",
      ownerId: "user-id",
    });

    act(() => result.current.onEditLocation("fridge"));
    expect(result.current.name).toBe("Fridge");
    act(() => result.current.onNameChange("Freezer"));
    act(() => result.current.onSaveEditor());
    expect(mutations.update_location.mutate).toHaveBeenCalledWith({
      id: "fridge",
      name: "Freezer",
    });
  });

  it("SHOULD not save an empty name, without an editor, AND close the editor", () => {
    const { result } = setup();

    act(() => result.current.onSaveEditor());
    act(() => result.current.onAddLocation());
    act(() => result.current.onNameChange("  "));
    act(() => result.current.onSaveEditor());
    expect(mutations.create_location.mutate).not.toHaveBeenCalled();

    act(() => result.current.onEditorClose());
    expect(result.current.editor).toBeUndefined();
  });
});

describe("actions", () => {
  it("SHOULD archive and reactivate categories and locations", () => {
    const { result } = setup();

    act(() => result.current.onSetStatus("category", "dairy", true));
    act(() => result.current.onSetStatus("location", "fridge", false));

    expect(mutations.update_category.mutate).toHaveBeenCalledWith({
      id: "dairy",
      status: "ARCHIVED",
    });
    expect(mutations.update_location.mutate).toHaveBeenCalledWith({
      id: "fridge",
      status: "ACTIVE",
    });
  });

  it("SHOULD confirm and cancel a delete of each kind", () => {
    const { result } = setup();

    act(() => result.current.onConfirmDelete());
    expect(mutations.delete_category.mutate).not.toHaveBeenCalled();

    act(() => result.current.onDelete("category", "old", "Old"));
    expect(result.current.toDelete).toEqual({
      id: "old",
      kind: "category",
      name: "Old",
    });
    act(() => result.current.onCancelDelete());
    expect(result.current.toDelete).toBeUndefined();

    act(() => result.current.onDelete("category", "old", "Old"));
    act(() => result.current.onConfirmDelete());
    expect(mutations.delete_category.mutate).toHaveBeenCalledWith({
      id: "old",
    });

    act(() => result.current.onDelete("location", "fridge", "Fridge"));
    act(() => result.current.onConfirmDelete());
    expect(mutations.delete_location.mutate).toHaveBeenCalledWith({
      id: "fridge",
    });
  });

  it("SHOULD use the default suggestions for the owner", () => {
    const { result } = setup();

    act(() => result.current.onUseCategorySuggestions());
    act(() => result.current.onUseLocationSuggestions());

    expect(mutations.suggest_categories.mutate).toHaveBeenCalledWith({
      owner: "USER",
      ownerId: "user-id",
    });
    expect(mutations.suggest_locations.mutate).toHaveBeenCalledWith({
      owner: "USER",
      ownerId: "user-id",
    });
  });

  it("SHOULD close the modal and retry the catalog", async () => {
    const { result } = setup();

    act(() => result.current.onClose());
    await act(async () => result.current.onRetry());

    expect(modalNavigation.closeModal).toHaveBeenCalled();
  });
});

describe("after a write", () => {
  it("SHOULD reset the mutations, close the editor and refresh the catalog and the lists", () => {
    const { result } = setup({ statuses: { create_category: "success" } });

    expect(mutations.create_category.reset).toHaveBeenCalled();
    expect(invalidateFetcherData).toHaveBeenCalledWith(["categories"]);
    expect(result.current.editor).toBeUndefined();
  });

  it.each([
    ["delete_category", new StockCategoryInUse(3), 3],
    ["delete_location", new StockLocationInUse(1), 1],
  ])(
    "SHOULD tell how many items use it WHEN %s is refused",
    (name, error, count) => {
      const { result } = setup({
        errors: { [name]: error },
        statuses: { [name]: "error" },
      });

      expect(result.current.inUseCount).toBe(count);
      expect(result.current.hasError).toBe(false);
    },
  );

  it("SHOULD show a generic error for any other failure", () => {
    const { result } = setup({
      errors: { create_category: new Error("x") },
      statuses: { create_category: "error" },
    });

    expect(result.current.hasError).toBe(true);
    expect(result.current.isBusy).toBe(false);
  });
});
