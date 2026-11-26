import StockEntity, {
  StockCategoryRef,
  StockExpirationStatus,
  StockForecast,
  StockForecastRow,
  StockLeftover,
  StockLocationRef,
  StockOwners,
  StockUnits,
  StockWaste90d,
} from "@domain/entities/stock/StockEntity";
import StockLotEntity, {
  StockLotStatus,
} from "@domain/entities/stock/StockLotEntity";

export interface IStockDTO {
  barcode?: string;
  brand?: string;
  category?: StockCategoryRef;
  categoryId?: string;
  createdAt?: Date;
  description: string;
  effectiveShoppingListId?: string;
  estimatedUnitPriceCents?: number;
  expirationStatus: StockExpirationStatus;
  forecast?: StockForecast;
  forecastRow?: StockForecastRow;
  hasExpiredLot: boolean;
  hasForecastRow?: boolean;
  hasOpenLot: boolean;
  id: string;
  idealQuantity?: number;
  leftover?: StockLeftover;
  location?: StockLocationRef;
  locationId?: string;
  lots: StockLotDTO[];
  minQuantity?: number;
  nearestExpiration?: Date;
  needsRestock: boolean;
  notes?: string;
  openedShelfLifeDays?: number;
  owner: StockOwners;
  ownerId: string;
  quantity: number;
  quickStep?: number;
  restockQuantity: number;
  shoppingListId?: string;
  stockOnly: boolean;
  unit: StockUnits;
  warnDaysClosed: number;
  warnDaysOpened: number;
  waste90d?: StockWaste90d;
}

class StockDTO implements IStockDTO {
  barcode?: string;
  brand?: string;
  category?: StockCategoryRef;
  categoryId?: string;
  createdAt?: Date;
  description: string;
  effectiveShoppingListId?: string;
  estimatedUnitPriceCents?: number;
  expirationStatus: StockExpirationStatus;
  forecast?: StockForecast;
  forecastRow?: StockForecastRow;
  hasExpiredLot: boolean;
  hasForecastRow?: boolean;
  hasOpenLot: boolean;
  id: string;
  idealQuantity?: number;
  leftover?: StockLeftover;
  location?: StockLocationRef;
  locationId?: string;
  lots: StockLotDTO[];
  minQuantity?: number;
  nearestExpiration?: Date;
  needsRestock: boolean;
  notes?: string;
  openedShelfLifeDays?: number;
  owner: StockOwners;
  ownerId: string;
  quantity: number;
  quickStep?: number;
  restockQuantity: number;
  shoppingListId?: string;
  stockOnly: boolean;
  unit: StockUnits;
  warnDaysClosed: number;
  warnDaysOpened: number;
  waste90d?: StockWaste90d;

  constructor(params: IStockDTO) {
    this.barcode = params.barcode;
    this.brand = params.brand;
    this.category = params.category;
    this.categoryId = params.categoryId;
    this.createdAt = params.createdAt;
    this.description = params.description;
    this.effectiveShoppingListId = params.effectiveShoppingListId;
    this.estimatedUnitPriceCents = params.estimatedUnitPriceCents;
    this.expirationStatus = params.expirationStatus;
    this.forecast = params.forecast;
    this.forecastRow = params.forecastRow;
    this.hasExpiredLot = params.hasExpiredLot;
    this.hasForecastRow = params.hasForecastRow ?? false;
    this.hasOpenLot = params.hasOpenLot;
    this.id = params.id;
    this.idealQuantity = params.idealQuantity;
    this.leftover = params.leftover;
    this.location = params.location;
    this.locationId = params.locationId;
    this.lots = params.lots;
    this.minQuantity = params.minQuantity;
    this.nearestExpiration = params.nearestExpiration;
    this.needsRestock = params.needsRestock;
    this.notes = params.notes;
    this.openedShelfLifeDays = params.openedShelfLifeDays;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.quantity = params.quantity;
    this.quickStep = params.quickStep;
    this.restockQuantity = params.restockQuantity;
    this.shoppingListId = params.shoppingListId;
    this.stockOnly = params.stockOnly;
    this.unit = params.unit;
    this.warnDaysClosed = params.warnDaysClosed;
    this.warnDaysOpened = params.warnDaysOpened;
    this.waste90d = params.waste90d;
  }

  static fromEntity(entity: StockEntity) {
    return new StockDTO({
      barcode: entity.barcode,
      brand: entity.brand,
      category: entity.category,
      categoryId: entity.categoryId,
      createdAt: entity.createdAt,
      description: entity.description,
      effectiveShoppingListId: entity.effectiveShoppingListId,
      estimatedUnitPriceCents: entity.estimatedUnitPriceCents,
      expirationStatus: entity.expirationStatus,
      forecast: entity.forecast,
      forecastRow: entity.forecastRow,
      hasExpiredLot: entity.hasExpiredLot,
      hasForecastRow: entity.hasForecastRow,
      hasOpenLot: entity.hasOpenLot,
      id: entity.id,
      idealQuantity: entity.idealQuantity,
      leftover: entity.leftover,
      location: entity.location,
      locationId: entity.locationId,
      lots: entity.lots.map((lot) => StockLotDTO.fromEntity(lot)),
      minQuantity: entity.minQuantity,
      nearestExpiration: entity.nearestExpiration,
      needsRestock: entity.needsRestock,
      notes: entity.notes,
      openedShelfLifeDays: entity.openedShelfLifeDays,
      owner: entity.owner,
      ownerId: entity.ownerId,
      quantity: entity.quantity,
      quickStep: entity.quickStep,
      restockQuantity: entity.restockQuantity,
      shoppingListId: entity.shoppingListId,
      stockOnly: entity.stockOnly,
      unit: entity.unit,
      warnDaysClosed: entity.warnDaysClosed,
      warnDaysOpened: entity.warnDaysOpened,
      waste90d: entity.waste90d,
    });
  }
}

export class StockLotDTO {
  constructor(
    readonly id: string,
    readonly quantity: number,
    readonly expirationStatus: StockLotStatus,
    readonly effectiveExpiration?: Date,
    readonly expirationDate?: Date,
    readonly openedAt?: Date,
    readonly purchaseDate?: Date,
    readonly unitPriceCents?: number,
    readonly currency?: string,
    readonly leftoverQuantity?: number,
    readonly leftoverDismissed: boolean = false,
  ) {}

  static fromEntity(entity: StockLotEntity) {
    return new StockLotDTO(
      entity.id,
      entity.quantity,
      entity.expirationStatus,
      entity.effectiveExpiration,
      entity.expirationDate,
      entity.openedAt,
      entity.purchaseDate,
      entity.unitPriceCents,
      entity.currency,
      entity.leftoverQuantity,
      entity.leftoverDismissed,
    );
  }
}

export default StockDTO;
