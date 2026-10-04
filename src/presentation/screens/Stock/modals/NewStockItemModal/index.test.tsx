import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";

import {
  fireEvent,
  hasText,
  mocks,
  screen,
  setup,
  spies,
} from "./mocks/index.mocks";

function press(label: string) {
  fireEvent.press(screen.UNSAFE_getAllByProps({ label })[0]);
}

it.each([
  ["owners are fetching", { isFetching: true }],
  ["owners are not loaded", { noOwners: true }],
])("SHOULD render only the loading state WHEN %s", (_, props) => {
  setup(props);

  expect(hasText("Loading")).toBe(true);
  expect(hasText("Add a new item to stock")).toBe(false);
});

it("SHOULD render the form WHEN owners are loaded", () => {
  setup();

  expect(hasText("Add a new item to stock")).toBe(true);
  expect(screen.UNSAFE_getAllByProps({ label: "Add" }).length).toBeGreaterThan(
    0,
  );
  expect(
    screen.UNSAFE_getAllByProps({ label: "Cancel" }).length,
  ).toBeGreaterThan(0);
});

it("SHOULD go back WHEN Cancel is pressed", () => {
  setup();

  press("Cancel");

  expect(spies.back).toHaveBeenCalledTimes(1);
});

it("SHOULD go back WHEN the backdrop is pressed", () => {
  setup();

  fireEvent.press(screen.UNSAFE_getAllByType(mocks.Pressable)[0]);

  expect(spies.back).toHaveBeenCalledTimes(1);
});

it("SHOULD NOT create the item WHEN the form is invalid", () => {
  const { mutate } = setup();
  mocks.validateForm.mockReturnValueOnce(undefined);

  press("Add");

  expect(mocks.validateForm).toHaveBeenCalledWith(mocks.owners);
  expect(mutate).not.toHaveBeenCalled();
});

it("SHOULD create the item with the validated params WHEN the form is valid", () => {
  const { mutate } = setup();
  const params = { description: "Rice", quantity: 2 };
  mocks.validateForm.mockReturnValueOnce(params);

  press("Add");

  expect(mutate).toHaveBeenCalledWith(params);
});

it("SHOULD go back WHEN the item was created", () => {
  setup({ status: "success" });

  expect(spies.back).toHaveBeenCalledTimes(1);
});

it("SHOULD NOT go back on mount WHEN the mutation is idle", () => {
  setup();

  expect(spies.back).not.toHaveBeenCalled();
});

it("SHOULD show an error message for each field with an error", () => {
  setup({
    errors: {
      description: "Description is required",
      quantity: "Quantity is required",
      unit: "Unit is required",
    },
  });

  expect(hasText("Description is required")).toBe(true);
  expect(hasText("Quantity is required")).toBe(true);
  expect(hasText("Unit is required")).toBe(true);
});

it("SHOULD NOT show error messages WHEN there are no errors", () => {
  setup();

  expect(screen.UNSAFE_queryAllByProps({ visible: true })).toHaveLength(0);
});

it("SHOULD forward text input changes to the form fields", () => {
  setup();

  fireEvent.changeText(
    screen.UNSAFE_getAllByProps({ label: "Description" })[0],
    "Rice",
  );
  fireEvent.changeText(
    screen.UNSAFE_getAllByProps({ label: "Quantity" })[0],
    "3",
  );
  fireEvent.changeText(
    screen.UNSAFE_getAllByProps({ label: "Barcode" })[0],
    "123",
  );
  fireEvent.changeText(
    screen.UNSAFE_getAllByProps({ label: "Brand" })[0],
    "Acme",
  );
  fireEvent.changeText(screen.UNSAFE_getAllByProps({ label: "Notes" })[0], "n");

  expect(mocks.fields.description.onChange).toHaveBeenCalledWith("Rice");
  expect(mocks.fields.quantity.onChange).toHaveBeenCalledWith("3");
  expect(mocks.fields.barcode.onChange).toHaveBeenCalledWith("123");
  expect(mocks.fields.brand.onChange).toHaveBeenCalledWith("Acme");
  expect(mocks.fields.notes.onChange).toHaveBeenCalledWith("n");
});

it("SHOULD show empty text for undefined optional fields", () => {
  setup();

  expect(screen.UNSAFE_getAllByProps({ label: "Barcode" })[0].props.value).toBe(
    "",
  );
  expect(screen.UNSAFE_getAllByProps({ label: "Brand" })[0].props.value).toBe(
    "",
  );
  expect(screen.UNSAFE_getAllByProps({ label: "Notes" })[0].props.value).toBe(
    "",
  );
});

it("SHOULD forward the unit selection to the form", () => {
  setup();
  const [unitPicker] = screen.UNSAFE_getAllByType(mocks.Picker);

  unitPicker.props.onValueChange(StockUnits.LITER);

  expect(mocks.fields.unit.onChange).toHaveBeenCalledWith(StockUnits.LITER);
});

it.each([
  ["owner-1", StockOwners.USER],
  ["owner-2", StockOwners.FAMILY],
])(
  "SHOULD set ownerId and owner type WHEN owner %s is selected",
  (ownerId, ownerType) => {
    setup();
    const [, ownerPicker] = screen.UNSAFE_getAllByType(mocks.Picker);

    ownerPicker.props.onValueChange(ownerId);

    expect(mocks.fields.ownerId.onChange).toHaveBeenCalledWith(ownerId);
    expect(mocks.fields.owner.onChange).toHaveBeenCalledWith(ownerType);
  },
);

it("SHOULD forward date selections to the matching fields", () => {
  setup();
  const [opening, expiration, purchase] = screen.UNSAFE_getAllByType(
    mocks.DatePicker,
  );
  const date = new Date("2025-02-01T00:00:00Z");

  opening.props.onConfirm({ date });
  expiration.props.onConfirm({ date });
  purchase.props.onConfirm({ date });

  expect(mocks.fields.openingDate.onChange).toHaveBeenCalledWith(date);
  expect(mocks.fields.expirationDate.onChange).toHaveBeenCalledWith(date);
  expect(mocks.fields.purchaseDate.onChange).toHaveBeenCalledWith(date);
});
