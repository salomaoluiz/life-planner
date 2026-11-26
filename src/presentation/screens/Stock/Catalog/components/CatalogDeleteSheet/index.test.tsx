import { fireEvent, render, screen } from "@tests";

import stockCatalogTestIds from "@screens/Stock/Catalog/testIds";

import CatalogDeleteSheet from "./";

jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const targets = [
  { label: "Meat", value: "meat" },
  { label: "Dairy", value: "dairy" },
];

function setup(overrides: Record<string, unknown> = {}) {
  const props = {
    busy: false,
    hasChildren: false,
    itemCount: 9,
    kind: "category" as const,
    name: "Cheese",
    onCancel: jest.fn(),
    onConfirm: jest.fn(),
    parentId: "dairy",
    targets,
    ...overrides,
  };

  render(<CatalogDeleteSheet {...props} />);

  return props;
}

it("SHOULD ask for a plain confirmation WHEN nothing uses it", () => {
  const props = setup({ hasChildren: true, itemCount: 0 });

  expect(
    screen.getByText('stock.catalog.delete.title {"name":"Cheese"}'),
  ).toBeOnTheScreen();
  expect(
    screen.getByText("stock.catalog.delete.subtreeNote"),
  ).toBeOnTheScreen();

  fireEvent.press(screen.getByText("stock.catalog.delete.confirmDelete"));
  expect(props.onConfirm).toHaveBeenCalledWith(undefined);
  fireEvent.press(screen.getByText("stock.catalog.form.cancel"));
  expect(props.onCancel).toHaveBeenCalled();
});

it("SHOULD move the items to the parent by default WHEN items use it", () => {
  const props = setup();

  expect(
    screen.getByText(
      'stock.catalog.delete.inUse_other {"count":9,"name":"Cheese"}',
    ),
  ).toBeOnTheScreen();
  expect(
    screen.getByText("stock.catalog.delete.archiveHint"),
  ).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(stockCatalogTestIds.deleteConfirm));
  expect(props.onConfirm).toHaveBeenCalledWith("dairy");
});

it("SHOULD leave the items without a category WHEN chosen", () => {
  const props = setup();

  fireEvent.press(
    screen.getByText("stock.catalog.delete.leaveWithoutCategory"),
  );
  fireEvent.press(screen.getByTestId(stockCatalogTestIds.deleteConfirm));

  expect(screen.queryByTestId(stockCatalogTestIds.deleteTarget)).toBeNull();
  expect(props.onConfirm).toHaveBeenCalledWith("none");
});

it("SHOULD say location in the leave option of a location", () => {
  setup({ kind: "location" });

  expect(
    screen.getByText("stock.catalog.delete.leaveWithoutLocation"),
  ).toBeOnTheScreen();
});

it("SHOULD disable the confirm button without a target to move to", () => {
  setup({ parentId: undefined });

  expect(screen.getByTestId(stockCatalogTestIds.deleteConfirm)).toBeDisabled();
});

it("SHOULD disable the move option WHEN there is nowhere to move", () => {
  setup({ parentId: undefined, targets: [] });

  expect(screen.getByTestId(stockCatalogTestIds.deleteConfirm)).toBeDisabled();
});
