import { fireEvent, render, screen } from "@tests";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import StockCatalogModal from "./";
import { useStockCatalogViewModel } from "./hooks";
import stockCatalogTestIds from "./testIds";

jest.mock("./hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const user = new OwnerDTO({ id: "user-id", name: "Ana", type: OwnerType.USER });
const family = new OwnerDTO({
  id: "family-id",
  name: "Silva",
  type: OwnerType.FAMILY,
});
function category(id: string, name: string, status = "ACTIVE") {
  return {
    children: [],
    id,
    itemCount: 2,
    name,
    status,
  };
}

function setup(overrides: Record<string, unknown> = {}) {
  const vm = {
    categories: [
      {
        category: category("dairy", "Dairy"),
        depth: 0,
        financeLabel: "Groceries",
        inherits: false,
      },
      {
        category: category("cheese", "Cheese"),
        depth: 1,
        financeLabel: undefined,
        inherits: true,
      },
      {
        category: category("meat", "Meat"),
        depth: 2,
        financeLabel: undefined,
        inherits: false,
      },
      {
        category: category("old", "Old", "ARCHIVED"),
        depth: 0,
        financeLabel: undefined,
        inherits: false,
      },
    ],
    editor: undefined,
    financeOptions: [{ label: "Groceries", value: "fin" }],
    hasError: false,
    inUseCount: undefined,
    isBusy: false,
    isEmptyCategories: false,
    isEmptyLocations: false,
    isLoading: false,
    locations: [
      { id: "fridge", itemCount: 3, name: "Fridge", status: "ACTIVE" },
      { id: "garage", itemCount: 0, name: "Garage", status: "ARCHIVED" },
    ],
    name: "",
    onAddCategory: jest.fn(),
    onAddLocation: jest.fn(),
    onCancelDelete: jest.fn(),
    onClose: jest.fn(),
    onConfirmDelete: jest.fn(),
    onDelete: jest.fn(),
    onEditCategory: jest.fn(),
    onEditLocation: jest.fn(),
    onEditorClose: jest.fn(),
    onFinanceChange: jest.fn(),
    onNameChange: jest.fn(),
    onOwnerChange: jest.fn(),
    onParentChange: jest.fn(),
    onRetry: jest.fn(),
    onSaveEditor: jest.fn(),
    onSetStatus: jest.fn(),
    onUseCategorySuggestions: jest.fn(),
    onUseLocationSuggestions: jest.fn(),
    owner: user,
    ownerOptions: [user, family],
    parentId: "",
    parentOptions: [{ label: "Dairy", value: "dairy" }],
    selectedFinanceId: "",
    toDelete: undefined,
    ...overrides,
  };

  jest.mocked(useStockCatalogViewModel).mockReturnValue(vm as never);
  render(<StockCatalogModal />);

  return { vm };
}

it("SHOULD render the title, the owner hint, the sections and the footnotes", () => {
  setup();

  expect(screen.getAllByText("stock.catalog.title").length).toBeGreaterThan(0);
  expect(screen.getByText("stock.catalog.categories")).toBeOnTheScreen();
  expect(screen.getByText("stock.catalog.locations")).toBeOnTheScreen();
  expect(screen.getByText("stock.catalog.categoryHint")).toBeOnTheScreen();
  expect(screen.getByText("stock.catalog.nothingAutomatic")).toBeOnTheScreen();
});

it("SHOULD choose the owner (Pessoal for the user, the name for a family)", () => {
  const { vm } = setup();

  expect(screen.getByText("stock.list.filter.personal")).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(`${stockCatalogTestIds.owner}-family-id`));

  expect(vm.onOwnerChange).toHaveBeenCalledWith("family-id");
});

describe("categories", () => {
  it("SHOULD list every category with its finance column, count and archived badge", () => {
    setup();

    expect(screen.getAllByTestId(stockCatalogTestIds.categoryRow)).toHaveLength(
      4,
    );
    expect(screen.getByText("Groceries · 2")).toBeOnTheScreen();
    expect(screen.getByText("stock.catalog.inherits · 2")).toBeOnTheScreen();
    expect(screen.getAllByText("stock.catalog.noMapping · 2")).toHaveLength(2);
    expect(
      screen.getAllByText("stock.catalog.archivedBadge").length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("stock.catalog.subcategory")).toHaveLength(2);
  });

  it("SHOULD add, edit, archive, reactivate and delete", () => {
    const { vm } = setup();

    fireEvent.press(screen.getByTestId(stockCatalogTestIds.addCategory));
    fireEvent.press(screen.getAllByText("stock.catalog.subcategory")[0]);
    fireEvent.press(screen.getAllByText("stock.catalog.rename")[0]);
    fireEvent.press(screen.getAllByText("stock.catalog.archive")[0]);
    fireEvent.press(screen.getAllByText("stock.catalog.reactivate")[0]);
    fireEvent.press(screen.getAllByTestId(stockCatalogTestIds.deleteButton)[0]);

    expect(vm.onAddCategory).toHaveBeenCalledWith();
    expect(vm.onAddCategory).toHaveBeenCalledWith("dairy");
    expect(vm.onEditCategory).toHaveBeenCalledWith("dairy");
    expect(vm.onSetStatus).toHaveBeenCalledWith("category", "dairy", true);
    expect(vm.onSetStatus).toHaveBeenCalledWith("category", "old", false);
    expect(vm.onDelete).toHaveBeenCalledWith("category", "dairy", "Dairy");
  });

  it("SHOULD offer the default suggestions WHEN there are no categories", () => {
    const { vm } = setup({ isEmptyCategories: true });

    expect(
      screen.getByText("stock.catalog.categoriesEmptyTitle"),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getAllByText("stock.catalog.useSuggestions")[0]);

    expect(vm.onUseCategorySuggestions).toHaveBeenCalled();
  });
});

describe("locations", () => {
  it("SHOULD list the locations AND act on them", () => {
    const { vm } = setup();

    expect(screen.getAllByTestId(stockCatalogTestIds.locationRow)).toHaveLength(
      2,
    );

    fireEvent.press(screen.getByTestId(stockCatalogTestIds.addLocation));
    fireEvent.press(screen.getAllByText("stock.catalog.rename")[4]);
    fireEvent.press(
      screen.getAllByText("stock.catalog.archive")[
        screen.getAllByText("stock.catalog.archive").length - 1
      ],
    );
    fireEvent.press(
      screen.getAllByText("stock.catalog.reactivate")[
        screen.getAllByText("stock.catalog.reactivate").length - 1
      ],
    );
    fireEvent.press(screen.getAllByText("stock.catalog.delete").pop() as never);

    expect(vm.onAddLocation).toHaveBeenCalled();
    expect(vm.onEditLocation).toHaveBeenCalledWith("fridge");
    expect(vm.onSetStatus).toHaveBeenCalledWith("location", "fridge", true);
    expect(vm.onSetStatus).toHaveBeenCalledWith("location", "garage", false);
    expect(vm.onDelete).toHaveBeenCalledWith("location", "garage", "Garage");
  });

  it("SHOULD offer the default suggestions WHEN there are no locations", () => {
    const { vm } = setup({ isEmptyLocations: true });

    expect(
      screen.getByText("stock.catalog.locationsEmptyTitle"),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getAllByText("stock.catalog.useSuggestions")[0]);

    expect(vm.onUseLocationSuggestions).toHaveBeenCalled();
  });
});

describe("editor and delete", () => {
  it("SHOULD edit a category with its parent and finance mapping, and save", () => {
    const { vm } = setup({
      editor: { id: "dairy", kind: "category" },
      name: "Dairy",
    });

    expect(
      screen.getByText("stock.catalog.editCategoryTitle"),
    ).toBeOnTheScreen();
    expect(screen.getByText("stock.catalog.parent")).toBeOnTheScreen();
    expect(screen.getByText("stock.catalog.financeMapping")).toBeOnTheScreen();

    fireEvent.changeText(
      screen.getByTestId(stockCatalogTestIds.nameInput),
      "Dairy 2",
    );
    fireEvent.press(screen.getByTestId(stockCatalogTestIds.financeSelect));
    fireEvent.press(screen.getByText("Groceries"));
    fireEvent.press(screen.getByTestId(stockCatalogTestIds.saveButton));

    expect(vm.onNameChange).toHaveBeenCalledWith("Dairy 2");
    expect(vm.onFinanceChange).toHaveBeenCalledWith("fin");
    expect(vm.onSaveEditor).toHaveBeenCalled();
  });

  it.each([
    [{ kind: "category" }, "stock.catalog.newCategoryTitle"],
    [{ id: "fridge", kind: "location" }, "stock.catalog.editLocationTitle"],
    [{ kind: "location" }, "stock.catalog.newLocationTitle"],
  ])("SHOULD title the editor %j", (editor, title) => {
    setup({ editor });

    expect(screen.getByText(title)).toBeOnTheScreen();
  });

  it("SHOULD not offer a parent or a mapping for a location", () => {
    setup({ editor: { kind: "location" } });

    expect(screen.queryByText("stock.catalog.parent")).toBeNull();
  });

  it("SHOULD confirm the deletion", () => {
    const { vm } = setup({
      toDelete: { id: "old", kind: "category", name: "Old" },
    });

    expect(
      screen.getByText('stock.catalog.deleteTitle {"name":"Old"}'),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getAllByText("stock.catalog.delete").pop() as never);

    expect(vm.onConfirmDelete).toHaveBeenCalled();
  });

  it("SHOULD tell how many items block a delete", () => {
    setup({ inUseCount: 3 });

    expect(screen.getByTestId(stockCatalogTestIds.inUse)).toHaveTextContent(
      'stock.catalog.inUse_other {"count":3}',
    );
  });

  it("SHOULD show a generic error with retry AND the skeleton while loading", () => {
    const { vm } = setup({ hasError: true });

    fireEvent.press(screen.getByText("common.actions.tryAgain"));
    expect(vm.onRetry).toHaveBeenCalled();

    setup({ isLoading: true });
    expect(
      screen.queryAllByText("stock.catalog.categories").length,
    ).toBeLessThanOrEqual(1);
  });
});
