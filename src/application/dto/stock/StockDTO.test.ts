import StockEntityFixture from "@domain/entities/stock/mocks/StockEntity.fixture";
import {
  StockCatalogStatus,
  StockCategoryEntity,
  StockLocationEntity,
} from "@domain/entities/stock/StockCatalogEntity";
import StockLotEntity, {
  StockLotStatus,
} from "@domain/entities/stock/StockLotEntity";
import StockMovementEntity, {
  StockMovementReasons,
  StockMovementTypes,
} from "@domain/entities/stock/StockMovementEntity";

import { StockCategoryDTO, StockLocationDTO } from "./StockCatalogDTO";
import StockDTO, { StockLotDTO } from "./StockDTO";
import StockMovementDTO from "./StockMovementDTO";

it("SHOULD copy every field of the entity AND its lots", () => {
  const lot = new StockLotEntity({
    effectiveExpiration: new Date(2026, 10, 15),
    expirationDate: new Date(2026, 10, 30),
    expirationStatus: StockLotStatus.EXPIRING,
    id: "lot",
    openedAt: new Date(2026, 10, 10),
    purchaseDate: new Date(2026, 10, 1),
    quantity: 1.5,
  });
  const entity = new StockEntityFixture()
    .withDefault()
    .withLots([lot])
    .withNeedsRestock()
    .withNearestExpiration(new Date(2026, 10, 15))
    .build();

  const dto = StockDTO.fromEntity(entity as never);

  expect(dto).toMatchObject({
    description: entity.description,
    id: entity.id,
    nearestExpiration: new Date(2026, 10, 15),
    needsRestock: true,
    quantity: entity.quantity,
    stockOnly: false,
    unit: entity.unit,
    warnDaysClosed: 7,
    warnDaysOpened: 1,
  });
  expect(dto.lots).toEqual([StockLotDTO.fromEntity(lot)]);
  expect(dto.lots[0]).toMatchObject({
    expirationStatus: "EXPIRING",
    quantity: 1.5,
  });
});

it("SHOULD copy a movement and keep a former member undefined", () => {
  const movement = new StockMovementEntity({
    createdAt: new Date(2026, 10, 10),
    id: "m",
    lotId: "l",
    note: "n",
    quantity: -1,
    reason: StockMovementReasons.EXPIRED,
    type: StockMovementTypes.DISCARD,
    user: { id: "u", name: "Ana" },
  });

  expect(StockMovementDTO.fromEntity(movement)).toMatchObject({
    reason: "EXPIRED",
    user: { name: "Ana" },
  });
  expect(
    StockMovementDTO.fromEntity({ ...movement, user: undefined } as never).user,
  ).toBeUndefined();
});

it("SHOULD copy the category tree and the locations", () => {
  const tree = new StockCategoryEntity({
    children: [
      new StockCategoryEntity({
        children: [],
        id: "c",
        itemCount: 1,
        name: "Cheese",
        parentId: "p",
        status: StockCatalogStatus.ACTIVE,
      }),
    ],
    id: "p",
    itemCount: 2,
    name: "Dairy",
    status: StockCatalogStatus.ARCHIVED,
  });

  expect(StockCategoryDTO.fromEntity(tree).children[0]).toMatchObject({
    id: "c",
    parentId: "p",
  });
  expect(StockCategoryDTO.fromEntity(tree)).toMatchObject({
    status: "ARCHIVED",
  });
  expect(
    StockLocationDTO.fromEntity(
      new StockLocationEntity({
        id: "l",
        itemCount: 3,
        name: "Pantry",
        status: StockCatalogStatus.ACTIVE,
      }),
    ),
  ).toMatchObject({ itemCount: 3, name: "Pantry" });
});
