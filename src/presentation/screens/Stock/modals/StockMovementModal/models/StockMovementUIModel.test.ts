import { StockLotDTO } from "@application/dto/stock/StockDTO";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { StockLotStatus } from "@domain/entities/stock/StockLotEntity";
import { StockMovementTypes } from "@domain/entities/stock/StockMovementEntity";
import { dto } from "@screens/Stock/models/stockUi.fixtures";

import StockMovementUIModel from "./StockMovementUIModel";

function lot(id: string, quantity: number, extra: Partial<StockLotDTO> = {}) {
  return {
    expirationStatus: StockLotStatus.OK,
    id,
    quantity,
    ...extra,
  } as StockLotDTO;
}
const lots = [
  lot("open", 1, {
    effectiveExpiration: new Date(2026, 10, 8),
    openedAt: new Date(2026, 10, 3),
  }),
  lot("closed", 3, { effectiveExpiration: new Date(2026, 10, 30) }),
  lot("none", 2),
];
function model(
  type: StockMovementTypes,
  unit = StockUnits.UNIT,
  withLots = lots,
) {
  return new StockMovementUIModel(
    dto((f) => f.withLots(withLots).withUnit(unit).withDescription("Milk")),
    type,
    "en-US",
  );
}

describe("what each type shows", () => {
  it.each([
    [StockMovementTypes.ENTRY, { expiration: true, lot: false, reason: true }],
    [
      StockMovementTypes.CONSUME,
      { expiration: false, lot: true, reason: false },
    ],
    [StockMovementTypes.OPEN, { expiration: false, lot: true, reason: false }],
    [
      StockMovementTypes.DISCARD,
      { expiration: false, lot: false, reason: true },
    ],
    [
      StockMovementTypes.ADJUST,
      { expiration: false, lot: true, reason: false },
    ],
  ])("SHOULD configure %s", (type, expected) => {
    const ui = model(type);

    expect(ui.showsExpiration).toBe(expected.expiration);
    expect(ui.showsLot).toBe(expected.lot);
    expect(ui.showsReason).toBe(expected.reason);
    expect(ui.quantityLabelKey).toBe(
      `stock.movement.quantity.${type.toLowerCase()}`,
    );
    expect(ui.description).toBe("Milk");
  });

  it("SHOULD offer the reasons of an entry and of a discard", () => {
    expect(
      model(StockMovementTypes.ENTRY).reasonOptions.map((o) => o.value),
    ).toEqual(["PURCHASE", "MANUAL"]);
    expect(
      model(StockMovementTypes.DISCARD).reasonOptions.map((o) => o.value),
    ).toEqual(["EXPIRED", "SPOILED", "OTHER"]);
  });
});

describe("lots", () => {
  it("SHOULD label the lots with their quantity and effective expiration", () => {
    const options = model(StockMovementTypes.CONSUME).lotOptions;

    expect(options.map((option) => [option.value, option.key])).toEqual([
      ["open", "stock.movement.lotOpened"],
      ["closed", "stock.movement.lotOption"],
      ["none", "stock.movement.lotNoExpiration"],
    ]);
    expect(options[0].quantity).toEqual({
      text: "1",
      unitKey: "common.units.unit",
    });
    expect(options[1].date).toBeDefined();
  });

  it("SHOULD offer only the closed lots to open", () => {
    expect(
      model(StockMovementTypes.OPEN).lotOptions.map((option) => option.value),
    ).toEqual(["closed", "none"]);
  });

  it("SHOULD find lots and the open ones", () => {
    const ui = model(StockMovementTypes.OPEN);

    expect(ui.hasOpenLot).toBe(true);
    expect(ui.nextOpenExpiration).toEqual(new Date(2026, 10, 8));
    expect(ui.lotById("closed")?.quantity).toBe(3);
    expect(ui.lotById()).toBeUndefined();
    expect(ui.defaultOpenLot()?.id).toBe("closed");
    expect(
      model(StockMovementTypes.OPEN, StockUnits.UNIT, [lots[1]]).hasOpenLot,
    ).toBe(false);
    expect(
      model(StockMovementTypes.OPEN, StockUnits.UNIT, [lots[1]])
        .nextOpenExpiration,
    ).toBeUndefined();
  });
});

describe("defaults and preview", () => {
  it("SHOULD start an OPEN at 1, a DISCARD at the whole lot and the others empty", () => {
    expect(model(StockMovementTypes.OPEN).initialQuantity()).toBe(1);
    expect(model(StockMovementTypes.DISCARD).initialQuantity("closed")).toBe(3);
    expect(model(StockMovementTypes.CONSUME).initialQuantity()).toBeUndefined();
    expect(model(StockMovementTypes.ENTRY).unit).toBe(StockUnits.UNIT);
  });

  it("SHOULD preview what stays closed and what opens, capped to the lot", () => {
    const ui = model(StockMovementTypes.OPEN, StockUnits.KILOGRAM);

    expect(ui.openPreview("closed", 1)).toEqual({
      before: { text: "3", unitKey: "common.units.kilogram" },
      opened: { text: "1", unitKey: "common.units.kilogram" },
      rest: { text: "2", unitKey: "common.units.kilogram" },
    });
    expect(ui.openPreview("closed", 9)?.rest).toBeUndefined();
    expect(ui.openPreview(undefined, 1)?.before.text).toBe("3");
  });

  it("SHOULD have no preview without a lot or a quantity", () => {
    const ui = model(StockMovementTypes.OPEN);

    expect(ui.openPreview("ghost", 1)).toBeUndefined();
    expect(ui.openPreview("closed", undefined)).toBeUndefined();
    expect(ui.openPreview("closed", 0)).toBeUndefined();
  });
});
