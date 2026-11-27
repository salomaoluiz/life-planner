import { fireEvent, render, screen } from "@tests";

import useCatalogFormViewModel from "@screens/Stock/Catalog/hooks/useCatalogFormViewModel";
import stockCatalogTestIds from "@screens/Stock/Catalog/testIds";

import CatalogForm from "./";

jest.mock("@screens/Stock/Catalog/hooks/useCatalogFormViewModel");
jest.mock("../StockIconPicker", () => ({
  __esModule: true,
  default: () => {
    const { Text } = jest.requireActual("react-native");

    return <Text>icon-picker</Text>;
  },
}));
jest.mock("@screens/Stock/containers/LocationQrPanel", () => ({
  __esModule: true,
  default: ({ location }: { location: { name: string } }) => {
    const { Text } = jest.requireActual("react-native");

    return <Text>{`qr:${location.name}`}</Text>;
  },
}));
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const existing = {
  children: [],
  color: "#3B82F6",
  icon: "cup",
  id: "dairy",
  itemCount: 4,
  name: "Dairy",
  owner: "USER",
  ownerId: "u",
  status: "ACTIVE",
};

function setup(
  kind: "category" | "location",
  overrides: Record<string, unknown> = {},
) {
  const vm = vmWith(overrides);
  const props = {
    categories: [],
    kind,
    locations: [],
    onAddChild: jest.fn(),
    onClose: jest.fn(),
    onDelete: jest.fn(),
    onSaved: jest.fn(),
    onViewItems: jest.fn(),
    ownerId: "u",
    ownerKind: "USER",
  };

  jest.mocked(useCatalogFormViewModel).mockReturnValue(vm as never);
  render(<CatalogForm {...props} />);

  return { props, vm };
}

function vmWith(overrides: Record<string, unknown> = {}) {
  return {
    applyToChildren: false,
    canAddChild: false,
    colorOptions: {
      base: [{ labelKey: "financial.colors.blue", value: "#3B82F6" }],
      shades: ["#2563EB"],
    },
    customDraft: "",
    customError: undefined,
    customOpen: false,
    existing: undefined,
    financeId: "",
    financeNodes: [
      { color: "#F59E0B", icon: "cart", id: "fin", name: "Mercado" },
    ],
    financeOptions: [{ label: "Mercado", value: "fin" }],
    hasDescendants: false,
    icon: "cup",
    iconColor: "#3B82F6",
    iconOpen: false,
    inheritedFinance: undefined,
    isArchived: false,
    isSaving: false,
    name: "Dairy",
    nameTaken: false,
    onApplyToggle: jest.fn(),
    onColorChange: jest.fn(),
    onCustomApply: jest.fn(),
    onCustomClose: jest.fn(),
    onCustomDraftChange: jest.fn(),
    onCustomOpen: jest.fn(),
    onFinanceChange: jest.fn(),
    onIconChange: jest.fn(),
    onIconClose: jest.fn(),
    onIconOpen: jest.fn(),
    onNameChange: jest.fn(),
    onParentChange: jest.fn(),
    onSave: jest.fn(),
    onToggleArchive: jest.fn(),
    ownerId: "u",
    parent: undefined,
    parentChoices: [{ label: "Meat", value: "meat" }],
    parentId: "",
    parentNodes: [
      { color: "#EF4444", icon: "food-steak", id: "meat", name: "Meat" },
    ],
    ruleError: false,
    ...overrides,
  };
}

it("SHOULD show the new category title with Dados and Aparência, save and cancel", () => {
  const { props, vm } = setup("category");

  expect(screen.getByText("stock.catalog.form.newCategory")).toBeOnTheScreen();
  expect(screen.getByText("stock.catalog.form.data")).toBeOnTheScreen();
  expect(screen.getByText("stock.catalog.form.appearance")).toBeOnTheScreen();
  expect(screen.queryByTestId(stockCatalogTestIds.deleteButton)).toBeNull();

  fireEvent.press(screen.getByTestId(stockCatalogTestIds.saveButton));
  expect(vm.onSave).toHaveBeenCalled();
  fireEvent.press(screen.getByTestId(stockCatalogTestIds.cancelButton));
  expect(props.onClose).toHaveBeenCalled();
});

it("SHOULD disable save without a name AND show the duplicate-name and rule errors", () => {
  setup("category", { name: " ", nameTaken: true, ruleError: true });

  expect(screen.getByTestId(stockCatalogTestIds.saveButton)).toBeDisabled();
  expect(
    screen.getByText('stock.catalog.form.nameTaken {"name":""}'),
  ).toBeOnTheScreen();
  expect(screen.getByText("stock.catalog.form.rule")).toBeOnTheScreen();
});

it("SHOULD edit with delete, archive, view items and the cascade switch", () => {
  const { props, vm } = setup("category", {
    existing,
    hasDescendants: true,
    parent: { name: "Meat" },
  });

  expect(screen.getByText("stock.catalog.form.editCategory")).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(stockCatalogTestIds.deleteButton));
  expect(props.onDelete).toHaveBeenCalledWith("dairy");
  fireEvent.press(screen.getByTestId(stockCatalogTestIds.archiveButton));
  expect(vm.onToggleArchive).toHaveBeenCalled();
  fireEvent.press(screen.getByTestId(stockCatalogTestIds.viewItems));
  expect(props.onViewItems).toHaveBeenCalledWith("dairy");
  expect(
    screen.getByTestId(stockCatalogTestIds.applyToChildren),
  ).toBeOnTheScreen();
  expect(screen.getByTestId(stockCatalogTestIds.shades)).toBeOnTheScreen();
});

it("SHOULD add a child from the edit sheet", () => {
  const { props } = setup("location", { canAddChild: true, existing });

  fireEvent.press(screen.getByTestId(stockCatalogTestIds.addChild));
  expect(props.onAddChild).toHaveBeenCalledWith("dairy");
  expect(
    screen.getByText("stock.catalog.form.newChildLocation"),
  ).toBeOnTheScreen();
});

it("SHOULD offer Reactivate for an archived row", () => {
  setup("category", {
    existing: { ...existing, status: "ARCHIVED" },
    isArchived: true,
  });

  expect(screen.getByText("stock.catalog.form.reactivate")).toBeOnTheScreen();
});

it("SHOULD explain the inherited finance category and the list default", () => {
  setup("category", {
    financeNodes: [
      { color: "#F59E0B", icon: "cart", id: "fin", name: "Mercado" },
    ],
    financeOptions: [{ label: "Mercado", value: "fin" }],
    inheritedFinance: "fin",
    parent: { name: "Dairy" },
  });

  expect(
    screen.getByText(
      'stock.catalog.form.financeInherits {"category":"Mercado","parent":"Dairy"}',
    ),
  ).toBeOnTheScreen();
});

it("SHOULD show the list default helper WHEN nothing is inherited", () => {
  setup("category");

  expect(
    screen.getByText("stock.catalog.form.financeListDefault"),
  ).toBeOnTheScreen();
});

it("SHOULD show the QR column of a saved location and a hint for a new one", () => {
  setup("location", { existing });
  expect(screen.getByText("qr:Dairy")).toBeOnTheScreen();
  expect(screen.getByText("stock.catalog.form.editLocation")).toBeOnTheScreen();
});

it("SHOULD ask to save a new location before showing its QR", () => {
  setup("location");

  expect(screen.getByText("stock.catalog.form.qrSaveFirst")).toBeOnTheScreen();
  expect(screen.getByText("stock.catalog.form.newLocation")).toBeOnTheScreen();
  expect(
    screen.queryByTestId(`${stockCatalogTestIds.financeSelect}-field`),
  ).toBeNull();
});

it("SHOULD open the icon picker and the custom color sheet", () => {
  const { vm } = setup("category");

  fireEvent.press(screen.getByTestId(stockCatalogTestIds.iconButton));
  expect(vm.onIconOpen).toHaveBeenCalled();
});

it("SHOULD render the icon picker WHEN open", () => {
  setup("category", { iconOpen: true });

  expect(screen.getByText("icon-picker")).toBeOnTheScreen();
});

it("SHOULD pick the parent and the finance category from the tree picker", () => {
  const { vm } = setup("category");
  const parent = stockCatalogTestIds.parentSelect;
  const finance = stockCatalogTestIds.financeSelect;

  fireEvent.press(screen.getByTestId(`${parent}-field`));
  fireEvent.press(screen.getByTestId(`${parent}-picker-option-meat`));
  fireEvent.press(screen.getByTestId(`${finance}-field`));
  fireEvent.press(screen.getByTestId(`${finance}-picker-none`));

  expect(vm.onParentChange).toHaveBeenCalledWith("meat");
  expect(vm.onFinanceChange).toHaveBeenCalledWith("");
});
