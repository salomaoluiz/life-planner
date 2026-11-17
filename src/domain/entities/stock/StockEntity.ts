import StockLotEntity from "@domain/entities/stock/StockLotEntity";

export enum StockExpirationStatus {
  EXPIRED = "EXPIRED",
  EXPIRING = "EXPIRING",
  NONE = "NONE",
  OK = "OK",
}

export enum StockOwners {
  FAMILY = "FAMILY",
  USER = "USER",
}

// Spec 116: kg and L take decimals (shown as g/ml below 1); gram and milliliter no longer exist.
export enum StockUnits {
  KILOGRAM = "kilogram",
  LITER = "liter",
  UNIT = "unit",
}

export interface StockCategoryRef {
  archived: boolean;
  id: string;
  name: string;
  path: string;
}

export interface StockLocationRef {
  archived: boolean;
  id: string;
  name: string;
}

interface IStockEntity {
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
  // The detail carries the lots; the list does not.
  lots?: StockLotEntity[];
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

class StockEntity {
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
  lots: StockLotEntity[];
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

  constructor(params: IStockEntity) {
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
    this.lots = params.lots ?? [];
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
}

export default StockEntity;
