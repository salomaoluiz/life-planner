import { act, renderHook } from "@tests";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import useForm from "./useForm";

const owners = [
  new OwnerDTO({ id: "owner-1", name: "Alice Test", type: OwnerType.USER }),
  new OwnerDTO({ id: "owner-2", name: "Test Family", type: OwnerType.FAMILY }),
];

function setup() {
  return renderHook(() => useForm());
}

function validate(result: ReturnType<typeof setup>["result"]) {
  let params: ReturnType<typeof result.current.validateForm>;
  act(() => {
    params = result.current.validateForm(owners);
  });
  return params!;
}

it("SHOULD start with default values and no errors", () => {
  const { result } = setup();

  expect(result.current.fields.description.value).toBe("");
  expect(result.current.fields.quantity.value).toBe("1");
  expect(result.current.fields.unit.value).toBe(StockUnits.UNIT);
  expect(result.current.errors).toEqual({});
});

it("SHOULD set required-field errors WHEN description, quantity and unit are empty", () => {
  const { result } = setup();
  act(() => {
    result.current.fields.quantity.onChange("");
    result.current.fields.unit.onChange("" as StockUnits);
  });

  expect(validate(result)).toBeUndefined();
  expect(result.current.errors).toEqual({
    description: "Description is required",
    quantity: "Quantity is required",
    unit: "Unit is required",
  });
});

it("SHOULD default to the first owner WHEN none is selected", () => {
  const { result } = setup();
  act(() => result.current.fields.description.onChange("Rice"));

  expect(validate(result)).toEqual({
    barcode: undefined,
    brand: undefined,
    description: "Rice",
    expirationDate: undefined,
    notes: undefined,
    openingDate: undefined,
    owner: OwnerType.USER,
    ownerId: "owner-1",
    purchaseDate: undefined,
    quantity: 1,
    unit: StockUnits.UNIT,
  });
});

it.each([
  ["owner-1", StockOwners.USER],
  ["owner-2", StockOwners.FAMILY],
])("SHOULD submit the selected owner WHEN owner id is %s", (ownerId, owner) => {
  const { result } = setup();
  const expirationDate = new Date("2025-03-01T00:00:00Z");
  act(() => {
    result.current.fields.description.onChange("Milk");
    result.current.fields.quantity.onChange("3");
    result.current.fields.unit.onChange(StockUnits.LITER);
    result.current.fields.ownerId.onChange(ownerId);
    result.current.fields.owner.onChange(owner);
    result.current.fields.brand.onChange("Acme");
    result.current.fields.barcode.onChange("123");
    result.current.fields.notes.onChange("note");
    result.current.fields.expirationDate.onChange(expirationDate);
  });

  expect(validate(result)).toEqual({
    barcode: "123",
    brand: "Acme",
    description: "Milk",
    expirationDate,
    notes: "note",
    openingDate: undefined,
    owner,
    ownerId,
    purchaseDate: undefined,
    quantity: 3,
    unit: StockUnits.LITER,
  });
});

it("SHOULD clear previous errors WHEN a later submit is valid", () => {
  const { result } = setup();
  validate(result);
  expect(result.current.errors.description).toBe("Description is required");

  act(() => result.current.fields.description.onChange("Rice"));
  validate(result);

  expect(result.current.errors).toEqual({});
});

it("SHOULD throw WHEN the owners list is empty and no owner is selected", () => {
  // Review Focus 1: pins current behavior; production code is unchanged.
  const { result } = setup();
  act(() => result.current.fields.description.onChange("Rice"));

  act(() => {
    expect(() => result.current.validateForm([])).toThrow();
  });
});
