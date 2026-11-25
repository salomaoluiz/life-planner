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
  DiscardValueSources,
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
    effectiveShoppingListId: stock.effectiveShoppingListId,
    estimatedUnitPriceCents: stock.estimatedUnitPriceCents,
    expirationStatus: stock.expirationStatus as StockExpirationStatus,
    forecast: stock.forecast,
    forecastRow: stock.forecastRow,
    hasExpiredLot: stock.hasExpiredLot,
    hasForecastRow: stock.hasForecastRow,
    hasOpenLot: stock.hasOpenLot,
    id: stock.id,
    idealQuantity: stock.idealQuantity,
    leftover: stock.leftover,
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
    quickStep: stock.quickStep,
    restockQuantity: stock.restockQuantity,
    shoppingListId: stock.shoppingListId,
    stockOnly: stock.stockOnly,
    unit: stock.unit as StockUnits,
    warnDaysClosed: stock.warnDaysClosed,
    warnDaysOpened: stock.warnDaysOpened,
    waste90d: stock.waste90d,
  });
}

export function toStockLotEntity(lot: StockLotModel): StockLotEntity {
  return new StockLotEntity({
    currency: lot.currency,
    effectiveExpiration: lot.effectiveExpiration,
    expirationDate: lot.expirationDate,
    expirationStatus: lot.expirationStatus as StockLotStatus,
    id: lot.id,
    leftoverDismissed: lot.leftoverDismissed,
    leftoverQuantity: lot.leftoverQuantity,
    openedAt: lot.openedAt,
    purchaseDate: lot.purchaseDate,
    quantity: lot.quantity,
    unitPriceCents: lot.unitPriceCents,
  });
}

export function toStockMovementEntity(
  movement: StockMovementModel,
): StockMovementEntity {
  return new StockMovementEntity({
    createdAt: movement.createdAt,
    currency: movement.currency,
    id: movement.id,
    lotId: movement.lotId,
    note: movement.note,
    quantity: movement.quantity,
    reason: movement.reason as StockMovementReasons | undefined,
    type: movement.type as StockMovementTypes,
    unitPriceCents: movement.unitPriceCents,
    user: movement.user,
    valueCents: movement.valueCents,
    valueSource: movement.valueSource as DiscardValueSources | undefined,
  });
}
