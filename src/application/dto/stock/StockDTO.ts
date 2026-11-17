import StockEntity, {
  StockCategoryRef,
  StockExpirationStatus,
  StockLocationRef,
  StockOwners,
  StockUnits,
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
  expirationStatus: StockExpirationStatus;
  hasOpenLot: boolean;
  id: string;
  idealQuantity?: number;
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
  restockQuantity: number;
  stockOnly: boolean;
  unit: StockUnits;
  warnDaysClosed: number;
  warnDaysOpened: number;
}

class StockDTO implements IStockDTO {
  barcode?: string;
  brand?: string;
  category?: StockCategoryRef;
  categoryId?: string;
  createdAt?: Date;
  description: string;
  expirationStatus: StockExpirationStatus;
  hasOpenLot: boolean;
  id: string;
  idealQuantity?: number;
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
  restockQuantity: number;
  stockOnly: boolean;
  unit: StockUnits;
  warnDaysClosed: number;
  warnDaysOpened: number;

  constructor(params: IStockDTO) {
    this.barcode = params.barcode;
    this.brand = params.brand;
    this.category = params.category;
    this.categoryId = params.categoryId;
    this.createdAt = params.createdAt;
    this.description = params.description;
    this.expirationStatus = params.expirationStatus;
    this.hasOpenLot = params.hasOpenLot;
    this.id = params.id;
    this.idealQuantity = params.idealQuantity;
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
    this.restockQuantity = params.restockQuantity;
    this.stockOnly = params.stockOnly;
    this.unit = params.unit;
    this.warnDaysClosed = params.warnDaysClosed;
    this.warnDaysOpened = params.warnDaysOpened;
  }

  static fromEntity(entity: StockEntity) {
    return new StockDTO({
      barcode: entity.barcode,
      brand: entity.brand,
      category: entity.category,
      categoryId: entity.categoryId,
      createdAt: entity.createdAt,
      description: entity.description,
      expirationStatus: entity.expirationStatus,
      hasOpenLot: entity.hasOpenLot,
      id: entity.id,
      idealQuantity: entity.idealQuantity,
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
      restockQuantity: entity.restockQuantity,
      stockOnly: entity.stockOnly,
      unit: entity.unit,
      warnDaysClosed: entity.warnDaysClosed,
      warnDaysOpened: entity.warnDaysOpened,
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
    );
  }
}

export default StockDTO;
