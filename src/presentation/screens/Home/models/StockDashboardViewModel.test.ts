import StockDashboardDTO from "@application/dto/home/StockDashboardDTO";
import StockDTO, { IStockDTO } from "@application/dto/stock/StockDTO";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";

import StockDashboardViewModel from "./StockDashboardViewModel";

function item(overrides: Partial<IStockDTO> = {}) {
  return new StockDTO({
    description: "Rice",
    id: "stock-1",
    owner: StockOwners.USER,
    ownerId: "owner-1",
    quantity: 1,
    unit: StockUnits.UNIT,
    ...overrides,
  });
}

function setup(stockDTOs: StockDTO[]) {
  return new StockDashboardViewModel({
    stockDashboardDTO: new StockDashboardDTO({ stockDTOs }),
  });
}

it("SHOULD count only items with positive quantity", () => {
  const vm = setup([
    item({ quantity: 2 }),
    item({ quantity: 0 }),
    item({ quantity: 1 }),
  ]);

  expect(vm.itemQuantity).toBe(2);
});

it("SHOULD report zero items WHEN the stock is empty", () => {
  const vm = setup([]);

  expect(vm.itemQuantity).toBe(0);
  expect(vm.expiredItems).toBe(0);
});

it("SHOULD NOT count items without an expiration date", () => {
  expect(setup([item(), item()]).expiredItems).toBe(0);
});

it("SHOULD count an item expired days ago", () => {
  const vm = setup([
    item({ expirationDate: new Date("2024-12-20T00:00:00Z") }),
  ]);

  expect(vm.expiredItems).toBe(1);
});

it("SHOULD NOT count an item expiring today", () => {
  const vm = setup([
    item({ expirationDate: new Date("2025-01-01T00:00:00Z") }),
  ]);

  expect(vm.expiredItems).toBe(0);
});

it("SHOULD also count an item expiring in the future", () => {
  // Pins current behavior: any non-zero day difference counts, so items
  // that are not expired yet are included (flagged in PR).
  const vm = setup([
    item({ expirationDate: new Date("2025-02-01T00:00:00Z") }),
  ]);

  expect(vm.expiredItems).toBe(1);
});
