import { act, renderHook } from "@testing-library/react-native";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { QuantityMode } from "@domain/entities/stock/stockQuantity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { dto } from "@screens/Stock/models/stockUi.fixtures";

import useForm, {
  buildCreateParams,
  buildUpdateParams,
  StockFormValues,
  validateStockForm,
  valuesFromItem,
} from "./useForm";

const owners = [
  new OwnerDTO({ id: "user-id", name: "Ana", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-id", name: "Silva", type: OwnerType.FAMILY }),
];
function input(text: string, mode = QuantityMode.SMALL) {
  return { mode, text };
}

function values(overrides: Partial<StockFormValues> = {}): StockFormValues {
  const { result } = renderHook(() => useForm("user-id", undefined));

  return { ...result.current.values, description: "Rice", ...overrides };
}

describe("validateStockForm", () => {
  it("SHOULD accept a filled form with an empty quantity (an item with no lot)", () => {
    expect(validateStockForm(values(), { isEdit: false })).toEqual({});
  });

  it.each([
    [
      "a missing description",
      { description: " " },
      "description",
      "stock.form.descriptionRequired",
    ],
    [
      "a decimal quantity on a UNIT item",
      { quantity: input("1,5") },
      "quantity",
      "stock.form.quantityInvalid",
    ],
    [
      "an ideal not above the minimum",
      { ideal: input("200"), min: input("300"), unit: StockUnits.KILOGRAM },
      "ideal",
      "stock.form.idealRule",
    ],
    [
      "shelf life 0",
      { openedShelfLifeDays: "0" },
      "shelfLife",
      "stock.form.shelfLifeInvalid",
    ],
    [
      "warn days above 365",
      { warnDaysClosed: "366" },
      "warnClosed",
      "stock.form.warnDaysInvalid",
    ],
    [
      "empty warn days",
      { warnDaysOpened: "" },
      "warnOpened",
      "stock.form.warnDaysInvalid",
    ],
  ] as const)("SHOULD flag %s", (_label, overrides, field, key) => {
    expect(
      validateStockForm(values(overrides as never), { isEdit: false })[field],
    ).toBe(key);
  });

  it("SHOULD not validate the quantity WHEN editing (it stays with the lots)", () => {
    expect(
      validateStockForm(values({ quantity: input("1,5") }), { isEdit: true })
        .quantity,
    ).toBeUndefined();
  });
});

describe("buildCreateParams", () => {
  it("SHOULD convert the typed g to kg, take the owner type and trim", () => {
    const params = buildCreateParams(
      values({
        brand: " Brand ",
        categoryId: "c",
        description: " Cheese ",
        ideal: input("1", QuantityMode.LARGE),
        min: input("300"),
        openedShelfLifeDays: "5",
        ownerId: "family-id",
        quantity: input("1,5", QuantityMode.LARGE),
        unit: StockUnits.KILOGRAM,
      }),
      owners,
      "user-id",
    );

    expect(params).toMatchObject({
      brand: "Brand",
      categoryId: "c",
      description: "Cheese",
      idealQuantity: 1,
      minQuantity: 0.3,
      openedShelfLifeDays: 5,
      owner: StockOwners.FAMILY,
      ownerId: "family-id",
      quantity: 1.5,
      stockOnly: false,
      warnDaysClosed: 7,
      warnDaysOpened: 1,
    });
  });

  it("SHOULD create with quantity 0 WHEN empty, use the default owner AND drop the limits of a stock-only item", () => {
    const params = buildCreateParams(
      values({ min: input("2"), ownerId: undefined, stockOnly: true }),
      owners,
      "user-id",
    );

    expect(params).toMatchObject({
      idealQuantity: undefined,
      minQuantity: undefined,
      owner: StockOwners.USER,
      ownerId: "user-id",
      quantity: 0,
      stockOnly: true,
    });
  });
});

describe("edit", () => {
  const stored = dto((f) =>
    f
      .withId("item")
      .withUnit(StockUnits.KILOGRAM)
      .withMinQuantity(0.3, 1)
      .withOpenedShelfLifeDays(5)
      .withCategory({ archived: false, id: "c", name: "A", path: "A" })
      .withLocation({ archived: false, id: "l", name: "L" }),
  );

  it("SHOULD fill the form from the stored item", () => {
    expect(valuesFromItem(stored)).toMatchObject({
      categoryId: "c",
      description: stored.description,
      ideal: { mode: QuantityMode.LARGE, text: "1" },
      locationId: "l",
      min: { mode: QuantityMode.SMALL, text: "300" },
      openedShelfLifeDays: "5",
      unit: StockUnits.KILOGRAM,
      warnDaysClosed: "7",
    });
    expect(valuesFromItem(dto()).openedShelfLifeDays).toBe("");
  });

  it("SHOULD send every editable field, null to clear, and no owner WHEN it stays", () => {
    const params = buildUpdateParams(
      {
        ...valuesFromItem(stored),
        barcode: "",
        brand: "",
        ideal: input(""),
        notes: "",
        openedShelfLifeDays: "",
      },
      stored,
      owners,
    );

    expect(params).toMatchObject({
      barcode: null,
      brand: null,
      categoryId: "c",
      id: "item",
      idealQuantity: null,
      minQuantity: 0.3,
      notes: null,
      openedShelfLifeDays: null,
      owner: undefined,
      ownerId: undefined,
      previousOwnerId: stored.ownerId,
      unit: undefined,
    });
  });

  it("SHOULD leave category and location to the API WHEN the owner changes, unless one was picked", () => {
    const moved = { ...valuesFromItem(stored), ownerId: "family-id" };

    expect(buildUpdateParams(moved, stored, owners)).toMatchObject({
      categoryId: undefined,
      locationId: undefined,
      owner: StockOwners.FAMILY,
      ownerId: "family-id",
    });
    expect(
      buildUpdateParams(
        { ...moved, categoryId: undefined, locationId: "other" },
        stored,
        owners,
      ),
    ).toMatchObject({
      categoryId: null,
      locationId: "other",
    });
  });

  it("SHOULD send the new unit WHEN it changed AND drop the limits of a stock-only item", () => {
    const params = buildUpdateParams(
      { ...valuesFromItem(stored), stockOnly: true, unit: StockUnits.LITER },
      stored,
      owners,
    );

    expect(params).toMatchObject({
      idealQuantity: undefined,
      minQuantity: undefined,
      stockOnly: true,
      unit: StockUnits.LITER,
    });
  });
});

describe("useForm", () => {
  it("SHOULD start clean, become dirty WHEN a field changes AND clean again when it goes back", () => {
    const { result } = renderHook(() => useForm("user-id", undefined));

    expect(result.current.isDirty).toBe(false);
    expect(result.current.values.ownerId).toBe("user-id");

    act(() => result.current.setField("description", "x"));
    expect(result.current.isDirty).toBe(true);

    act(() => result.current.setField("description", ""));
    expect(result.current.isDirty).toBe(false);
  });

  it("SHOULD compare dates and quantities by value", () => {
    const { result } = renderHook(() => useForm("user-id", undefined));

    act(() => result.current.setField("expirationDate", new Date(2026, 10, 1)));
    act(() => result.current.setField("min", input("5")));

    expect(result.current.isDirty).toBe(true);

    act(() => result.current.setField("expirationDate", undefined));
    act(() => result.current.setField("min", input("")));

    expect(result.current.isDirty).toBe(false);
  });

  it("SHOULD show errors only after the first submit AND report validity", () => {
    const { result } = renderHook(() => useForm("user-id", undefined));

    expect(result.current.errors).toEqual({});

    let valid = true;

    act(() => {
      valid = result.current.isValid();
    });

    expect(valid).toBe(false);
    expect(result.current.errors.description).toBe(
      "stock.form.descriptionRequired",
    );

    act(() => result.current.setField("description", "Rice"));
    act(() => {
      valid = result.current.isValid();
    });

    expect(valid).toBe(true);
  });

  it("SHOULD start from the stored values in edit mode", () => {
    const stored = valuesFromItem(dto((f) => f.withDescription("Stored")));
    const { result } = renderHook(() => useForm("user-id", stored));

    expect(result.current.values.description).toBe("Stored");
    expect(result.current.isDirty).toBe(false);
  });
});
