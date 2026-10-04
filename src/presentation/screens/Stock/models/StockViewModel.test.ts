import StockDTO, { IStockDTO } from "@application/dto/stock/StockDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import StockViewModel from "./StockViewModel";

const owners = [
  new OwnerDTO({ id: "owner-1", name: "Alice Test", type: OwnerType.USER }),
  new OwnerDTO({ id: "owner-2", name: "Test Family", type: OwnerType.FAMILY }),
];

function setup(overrides: Partial<IStockDTO> = {}) {
  const dto = new StockDTO({
    description: "Rice",
    id: "stock-1",
    owner: StockOwners.USER,
    ownerId: "owner-1",
    quantity: 2,
    unit: StockUnits.KILOGRAM,
    ...overrides,
  });

  return new StockViewModel(dto, owners);
}

it("SHOULD expose description, quantity with unit and ids", () => {
  const vm = setup();

  expect(vm.description).toBe("Rice");
  expect(vm.quantity).toBe("2 kilogram");
  expect(vm.ids).toEqual({ itemId: "stock-1", ownerId: "owner-1" });
});

it("SHOULD label the owner as Personal WHEN owner is USER", () => {
  expect(setup().owner).toBe("Alice Test (Personal)");
});

it("SHOULD label the owner as Family WHEN owner is FAMILY", () => {
  const vm = setup({ owner: StockOwners.FAMILY, ownerId: "owner-2" });

  expect(vm.owner).toBe("Test Family (Family)");
});

it("SHOULD render undefined name WHEN the owner id is unknown", () => {
  // Pins current behavior (Review Focus 2).
  expect(setup({ ownerId: "missing" }).owner).toBe("undefined (Personal)");
});

it("SHOULD return undefined dates WHEN none are provided", () => {
  expect(setup().dates).toEqual({
    expirationDate: undefined,
    openingDate: undefined,
    purchaseDate: undefined,
  });
});

it("SHOULD format every date WHEN provided", () => {
  const expirationDate = new Date("2025-02-01T12:00:00Z");
  const openingDate = new Date("2025-01-10T12:00:00Z");
  const purchaseDate = new Date("2025-01-05T12:00:00Z");

  expect(setup({ expirationDate, openingDate, purchaseDate }).dates).toEqual({
    expirationDate: expirationDate.toLocaleDateString(),
    openingDate: openingDate.toLocaleDateString(),
    purchaseDate: purchaseDate.toLocaleDateString(),
  });
});

it("SHOULD NOT be expired nor close to expiration WHEN there is no expiration date", () => {
  const vm = setup();

  expect(vm.isExpired).toBe(false);
  expect(vm.isCloseToExpiration).toBe(false);
});

it.each([
  ["2024-12-31T00:00:00Z", true],
  ["2025-01-02T00:00:00Z", false],
])("SHOULD report isExpired for %s as %s", (date, expected) => {
  expect(setup({ expirationDate: new Date(date) }).isExpired).toBe(expected);
});

it.each([
  ["2025-01-02T00:00:00Z", true],
  ["2025-01-08T00:00:00Z", true],
  ["2024-12-20T00:00:00Z", false],
])("SHOULD report isCloseToExpiration for %s as %s", (date, expected) => {
  // Review Focus 3: difference(today, expiration) is negative for future
  // dates, so any future date counts as close. Pins current behavior.
  expect(setup({ expirationDate: new Date(date) }).isCloseToExpiration).toBe(
    expected,
  );
});

it("SHOULD report expired status with the formatted date WHEN expired", () => {
  const expirationDate = new Date("2024-12-31T00:00:00Z");

  expect(setup({ expirationDate }).status).toBe(
    `Expired on ${expirationDate.toLocaleDateString()}`,
  );
});

it("SHOULD report close to expiration WHEN not expired but within a week", () => {
  const vm = setup({ expirationDate: new Date("2025-01-05T00:00:00Z") });

  expect(vm.status).toBe("Close to expiration");
});

it("SHOULD report out of stock WHEN quantity is 0 and there is no expiration date", () => {
  expect(setup({ quantity: 0 }).status).toBe("Out of stock");
});

it("SHOULD report in stock WHEN quantity is positive and there is no expiration date", () => {
  expect(setup().status).toBe("In stock");
});
