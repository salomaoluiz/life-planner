import { StockUnits } from "@domain/entities/stock/StockEntity";
import { QuantityMode } from "@domain/entities/stock/stockQuantity";

import { fireEvent, screen, setup } from "./mocks/index.mocks";
import stockItemFormTestIds from "./testIds";

const empty = { mode: QuantityMode.SMALL, text: "" };
function values(overrides: Record<string, unknown> = {}) {
  return {
    barcode: "",
    brand: "",
    description: "",
    ideal: empty,
    min: empty,
    notes: "",
    openedShelfLifeDays: "",
    ownerId: "user-id",
    quantity: empty,
    step: empty,
    stockOnly: false,
    unit: StockUnits.UNIT,
    warnDaysClosed: "7",
    warnDaysOpened: "1",
    ...overrides,
  };
}

it("SHOULD render the sections and the main fields of a new item", () => {
  setup();

  expect(screen.getByText("stock.form.title")).toBeOnTheScreen();
  expect(screen.getByText("stock.form.itemSection")).toBeOnTheScreen();
  expect(screen.getByText("stock.form.firstLotSection")).toBeOnTheScreen();
  expect(screen.getByText("stock.form.description")).toBeOnTheScreen();
  expect(screen.getByText("stock.form.category")).toBeOnTheScreen();
  expect(screen.getByText("stock.form.location")).toBeOnTheScreen();
  expect(screen.getByText("stock.form.unit")).toBeOnTheScreen();
  expect(screen.getByText("stock.form.expiration")).toBeOnTheScreen();
  expect(screen.getByText("stock.form.minHintEmpty")).toBeOnTheScreen();
});

it("SHOULD render the edit title and hide the first lot WHEN editing", () => {
  setup({ isEdit: true });

  expect(screen.getByText("stock.form.editTitle")).toBeOnTheScreen();
  expect(screen.queryByText("stock.form.firstLotSection")).toBeNull();
  expect(screen.getByText("stock.form.quantityEditHint")).toBeOnTheScreen();
});

it("SHOULD hide the extra fields until more options is open AND toggle it", () => {
  const { vm } = setup();

  expect(screen.queryByText("stock.form.brand")).toBeNull();

  fireEvent.press(screen.getByText("stock.form.moreDetails"));

  expect(vm.onToggleMore).toHaveBeenCalled();
});

it("SHOULD show every extra field WHEN more options is open", () => {
  setup({ isMoreOpen: true });

  [
    "brand",
    "shelfLife",
    "warnClosed",
    "warnOpened",
    "barcode",
    "owner",
    "notes",
  ].forEach((key) => {
    expect(screen.getByText(`stock.form.${key}`)).toBeOnTheScreen();
  });
});

it("SHOULD show the translated field errors", () => {
  setup({
    errors: {
      description: "stock.form.descriptionRequired",
      ideal: "stock.form.idealRule",
      quantity: "stock.form.quantityInvalid",
      shelfLife: "stock.form.shelfLifeInvalid",
      warnClosed: "stock.form.warnDaysInvalid",
      warnOpened: "stock.form.warnDaysInvalid",
    },
    isMoreOpen: true,
  });

  expect(screen.getByText("stock.form.descriptionRequired")).toBeOnTheScreen();
  expect(screen.getByText("stock.form.idealRule")).toBeOnTheScreen();
  expect(screen.getByText("stock.form.quantityInvalid")).toBeOnTheScreen();
  expect(screen.getByText("stock.form.shelfLifeInvalid")).toBeOnTheScreen();
  expect(screen.getAllByText("stock.form.warnDaysInvalid")).toHaveLength(2);
});

describe("fields", () => {
  it("SHOULD set the description, brand, shelf life, warn days, barcode and notes (digits only)", () => {
    const { vm } = setup({ isMoreOpen: true });

    fireEvent.changeText(
      screen.getByLabelText("stock.form.description"),
      "Leite",
    );
    fireEvent.changeText(screen.getByLabelText("stock.form.brand"), "Brand");
    fireEvent.changeText(screen.getByLabelText("stock.form.shelfLife"), "5d");
    fireEvent.changeText(screen.getByLabelText("stock.form.warnClosed"), "3x");
    fireEvent.changeText(screen.getByLabelText("stock.form.warnOpened"), "0");
    fireEvent.changeText(screen.getByLabelText("stock.form.barcode"), "789");
    fireEvent.changeText(screen.getByLabelText("stock.form.notes"), "n");

    expect(vm.setField).toHaveBeenCalledWith("description", "Leite");
    expect(vm.setField).toHaveBeenCalledWith("brand", "Brand");
    expect(vm.setField).toHaveBeenCalledWith("openedShelfLifeDays", "5");
    expect(vm.setField).toHaveBeenCalledWith("warnDaysClosed", "3");
    expect(vm.setField).toHaveBeenCalledWith("warnDaysOpened", "0");
    expect(vm.setField).toHaveBeenCalledWith("barcode", "789");
    expect(vm.setField).toHaveBeenCalledWith("notes", "n");
  });

  it("SHOULD switch the unit kind WHEN a chip is pressed AND ignore an unknown one", () => {
    const { vm } = setup();

    fireEvent.press(
      screen.getByTestId(`${stockItemFormTestIds.unitSelect}-kilogram`),
    );

    expect(vm.setField).toHaveBeenCalledWith("unit", "kilogram");
  });

  it("SHOULD type the quantity, the minimum and the ideal in the unit of the item", () => {
    const { vm } = setup({ values: values({ unit: StockUnits.KILOGRAM }) });

    fireEvent.changeText(
      screen.getByTestId(stockItemFormTestIds.quantityInput),
      "1500",
    );
    fireEvent.changeText(
      screen.getByTestId(stockItemFormTestIds.minInput),
      "300",
    );
    fireEvent.changeText(
      screen.getByTestId(stockItemFormTestIds.idealInput),
      "2",
    );

    expect(vm.setField).toHaveBeenCalledWith("quantity", {
      mode: QuantityMode.LARGE,
      text: "1,5",
    });
    expect(vm.setField).toHaveBeenCalledWith("min", {
      mode: QuantityMode.SMALL,
      text: "300",
    });
    expect(vm.setField).toHaveBeenCalledWith("ideal", {
      mode: QuantityMode.SMALL,
      text: "2",
    });
    expect(screen.getByText("stock.form.quantityHintWeight")).toBeOnTheScreen();
  });

  it.each([
    [StockUnits.LITER, "stock.form.quantityHintVolume"],
    [StockUnits.UNIT, "stock.form.quantityHintUnit"],
  ])("SHOULD hint the quantity of a %s item", (unit, key) => {
    setup({ values: values({ unit }) });

    expect(screen.getByText(key)).toBeOnTheScreen();
  });

  it("SHOULD say when the item asks to be restocked", () => {
    setup({
      values: values({
        min: { mode: QuantityMode.SMALL, text: "300" },
        unit: StockUnits.KILOGRAM,
      }),
    });

    expect(
      screen.getByText(
        'stock.form.minHintSet {"quantity":"300 common.units.gram"}',
      ),
    ).toBeOnTheScreen();
  });

  it("SHOULD mark and unmark stock only", () => {
    const { vm } = setup();

    fireEvent.press(
      screen.getByTestId(`${stockItemFormTestIds.stockOnly}-stockOnly`),
    );

    expect(vm.setField).toHaveBeenCalledWith("stockOnly", true);
  });

  it("SHOULD pick the category and the location (or none)", () => {
    const { vm } = setup({ values: values({ categoryId: "cat-1" }) });

    fireEvent.press(screen.getByTestId(stockItemFormTestIds.categorySelect));
    fireEvent.press(screen.getByText("stock.form.noCategory"));
    fireEvent.press(screen.getByTestId(stockItemFormTestIds.locationSelect));
    fireEvent.press(screen.getByText("Fridge"));

    expect(vm.setField).toHaveBeenCalledWith("categoryId", undefined);
    expect(vm.setField).toHaveBeenCalledWith("locationId", "loc-1");
  });

  it("SHOULD choose the owner AND show the family name", () => {
    const { vm } = setup({ isMoreOpen: true });

    fireEvent.press(
      screen.getByTestId(`${stockItemFormTestIds.owner}-family-id`),
    );

    expect(vm.onOwnerChange).toHaveBeenCalledWith("family-id");
  });
});

describe("suggestions and owner change", () => {
  it("SHOULD offer to add stock to a similar item", () => {
    const { vm } = setup({
      suggestion: {
        name: "Cheese",
        quantity: { text: "250", unitKey: "common.units.gram" },
      },
    });

    expect(
      screen.getByText(
        'stock.form.suggestion.exists {"name":"Cheese","qty":"250 common.units.gram"}',
      ),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId(stockItemFormTestIds.suggestionAction));

    expect(vm.onAddToSuggestion).toHaveBeenCalled();
  });

  it("SHOULD explain what happens to the category and the location WHEN the owner changes", () => {
    setup({
      isEdit: true,
      isMoreOpen: true,
      ownerChangePreview: {
        category: { from: "Dairy", to: undefined },
        location: { from: "Fridge", to: "Fridge" },
      },
      values: values({ ownerId: "family-id" }),
    });

    expect(screen.getByText("stock.form.ownerChange.title")).toBeOnTheScreen();
    expect(
      screen.getByText(
        'stock.form.ownerChange.noCategory {"name":"Dairy","owner":"Silva"}',
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(
        'stock.form.ownerChange.keepsLocation {"name":"Fridge","owner":"Silva"}',
      ),
    ).toBeOnTheScreen();
  });

  it("SHOULD say a category that stays WHEN it exists in the new owner, and say nothing about an empty one", () => {
    setup({
      isEdit: true,
      isMoreOpen: true,
      ownerChangePreview: {
        category: { from: "Dairy", to: "Dairy" },
        location: {},
      },
    });

    expect(
      screen.getByText(
        'stock.form.ownerChange.keepsCategory {"name":"Dairy","owner":"Ana"}',
      ),
    ).toBeOnTheScreen();
    expect(
      screen.queryByText(/ownerChange\.(noLocation|keepsLocation)/),
    ).toBeNull();
  });
});

describe("actions", () => {
  it("SHOULD save AND show the form error and the discard dialog", () => {
    const { vm } = setup({
      formErrorKey: "common.errors.generic",
      isDiscardOpen: true,
    });

    fireEvent.press(screen.getByTestId(stockItemFormTestIds.saveButton));

    expect(vm.onSave).toHaveBeenCalled();
    expect(screen.getByText("common.errors.generic")).toBeOnTheScreen();
    expect(screen.getByText("common.form.discardTitle")).toBeOnTheScreen();

    fireEvent.press(screen.getByText("common.form.keepEditing"));
    fireEvent.press(screen.getByText("common.form.discard"));

    expect(vm.onKeepEditing).toHaveBeenCalled();
    expect(vm.onDiscard).toHaveBeenCalled();
  });

  it("SHOULD show a skeleton instead of the form while loading", () => {
    setup({ isLoading: true });

    expect(screen.queryByText("stock.form.description")).toBeNull();
  });

  it("SHOULD render on a wide screen too", () => {
    setup({ isMoreOpen: true }, "expanded");

    expect(screen.getByText("stock.form.brand")).toBeOnTheScreen();
  });
});
