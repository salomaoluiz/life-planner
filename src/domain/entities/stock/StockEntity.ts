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

// Spec 123 FR 8: the stored forecast of the item (rates in the item unit; dates are calendar days).
export interface StockForecast {
  computedOn?: Date;
  dailyRate: number;
  emptyDate?: Date;
  minDate?: Date;
  status: StockForecastStatus;
  weeklyRate: number;
}

// Spec 123 FR 19: the FORECAST row of the item on its list.
export interface StockForecastRow {
  listId: string;
  listName?: string;
  quantity: number;
}

export type StockForecastStatus = "INSUFFICIENT_DATA" | "NO_CONSUMPTION" | "OK";

// Spec 123 FR 23: the worst lot that will expire before it is used.
export interface StockLeftover {
  date: Date;
  lotId: string;
  quantity: number;
}

export interface StockLocationRef {
  archived: boolean;
  id: string;
  name: string;
}

// Spec 123 FR 32: "Descartado nos últimos 90 dias".
export interface StockWaste90d {
  count: number;
  mainReason: string;
  quantity: number;
  totals: { currency: string; valueCents: number }[];
}

interface IStockEntity {
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
  quickStep?: number;
  restockQuantity: number;
  shoppingListId?: string;
  stockOnly: boolean;
  unit: StockUnits;
  warnDaysClosed: number;
  warnDaysOpened: number;
  waste90d?: StockWaste90d;
}

class StockEntity {
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
  hasForecastRow: boolean;
  hasOpenLot: boolean;
  id: string;
  idealQuantity?: number;
  leftover?: StockLeftover;
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
  quickStep?: number;
  restockQuantity: number;
  shoppingListId?: string;
  stockOnly: boolean;
  unit: StockUnits;
  warnDaysClosed: number;
  warnDaysOpened: number;
  waste90d?: StockWaste90d;

  constructor(params: IStockEntity) {
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
    this.lots = params.lots ?? [];
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
}

export default StockEntity;
