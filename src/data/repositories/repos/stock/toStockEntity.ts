import StockLotModel from "@data/models/stock/StockLotModel";
import StockModel from "@data/models/stock/StockModel";
import StockMovementModel from "@data/models/stock/StockMovementModel";
import StockEntity, {
  StockExpirationStatus,
  StockOwners,
  StockUnits,
} from "@domain/entities/stock/StockEntity";
import StockLotEntity, {
  StockLotStatus,
} from "@domain/entities/stock/StockLotEntity";
import StockMovementEntity, {
  StockMovementReasons,
  StockMovementTypes,
} from "@domain/entities/stock/StockMovementEntity";

export function toStockEntity(stock: StockModel): StockEntity {
  return new StockEntity({
    barcode: stock.barcode,
    brand: stock.brand,
    category: stock.category,
    categoryId: stock.categoryId,
    createdAt: stock.createdAt,
    description: stock.description,
    expirationStatus: stock.expirationStatus as StockExpirationStatus,
    hasOpenLot: stock.hasOpenLot,
    id: stock.id,
    idealQuantity: stock.idealQuantity,
    location: stock.location,
    locationId: stock.locationId,
    lots: stock.lots?.map((lot) => toStockLotEntity(lot)),
    minQuantity: stock.minQuantity,
    nearestExpiration: stock.nearestExpiration,
    needsRestock: stock.needsRestock,
    notes: stock.notes,
    openedShelfLifeDays: stock.openedShelfLifeDays,
    owner: stock.owner as StockOwners,
    ownerId: stock.ownerId,
    quantity: stock.quantity,
    restockQuantity: stock.restockQuantity,
    stockOnly: stock.stockOnly,
    unit: stock.unit as StockUnits,
    warnDaysClosed: stock.warnDaysClosed,
    warnDaysOpened: stock.warnDaysOpened,
  });
}

export function toStockLotEntity(lot: StockLotModel): StockLotEntity {
  return new StockLotEntity({
    effectiveExpiration: lot.effectiveExpiration,
    expirationDate: lot.expirationDate,
    expirationStatus: lot.expirationStatus as StockLotStatus,
    id: lot.id,
    openedAt: lot.openedAt,
    purchaseDate: lot.purchaseDate,
    quantity: lot.quantity,
  });
}

export function toStockMovementEntity(
  movement: StockMovementModel,
): StockMovementEntity {
  return new StockMovementEntity({
    createdAt: movement.createdAt,
    id: movement.id,
    lotId: movement.lotId,
    note: movement.note,
    quantity: movement.quantity,
    reason: movement.reason as StockMovementReasons | undefined,
    type: movement.type as StockMovementTypes,
    user: movement.user,
  });
}
