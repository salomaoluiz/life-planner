import StockLotModel from "@data/models/stock/StockLotModel";
import { formatDay, optionalDay } from "@domain/entities/stock/stockDay";

interface CategoryRef {
  archived: boolean;
  id: string;
  name: string;
  path: string;
}

interface IStockModel {
  barcode?: string;
  brand?: string;
  category?: CategoryRef;
  categoryId?: string;
  createdAt?: Date;
  description: string;
  effectiveShoppingListId?: string;
  estimatedUnitPriceCents?: number;
  expirationStatus: string;
  hasExpiredLot: boolean;
  hasOpenLot: boolean;
  id: string;
  idealQuantity?: number;
  location?: LocationRef;
  locationId?: string;
  lots?: StockLotModel[];
  minQuantity?: number;
  nearestExpiration?: Date;
  needsRestock: boolean;
  notes?: string;
  openedShelfLifeDays?: number;
  owner: string;
  ownerId: string;
  quantity: number;
  quickStep?: number;
  restockQuantity: number;
  shoppingListId?: string;
  stockOnly: boolean;
  unit: string;
  warnDaysClosed: number;
  warnDaysOpened: number;
}

interface LocationRef {
  archived: boolean;
  id: string;
  name: string;
}

class StockModel implements IStockModel {
  barcode?: string;
  brand?: string;
  category?: CategoryRef;
  categoryId?: string;
  createdAt?: Date;
  description: string;
  effectiveShoppingListId?: string;
  estimatedUnitPriceCents?: number;
  expirationStatus: string;
  hasExpiredLot: boolean;
  hasOpenLot: boolean;
  id: string;
  idealQuantity?: number;
  location?: LocationRef;
  locationId?: string;
  lots?: StockLotModel[];
  minQuantity?: number;
  nearestExpiration?: Date;
  needsRestock: boolean;
  notes?: string;
  openedShelfLifeDays?: number;
  owner: string;
  ownerId: string;
  quantity: number;
  quickStep?: number;
  restockQuantity: number;
  shoppingListId?: string;
  stockOnly: boolean;
  unit: string;
  warnDaysClosed: number;
  warnDaysOpened: number;

  constructor(params: IStockModel) {
    this.barcode = params.barcode;
    this.brand = params.brand;
    this.category = params.category;
    this.categoryId = params.categoryId;
    this.createdAt = params.createdAt;
    this.description = params.description;
    this.effectiveShoppingListId = params.effectiveShoppingListId;
    this.estimatedUnitPriceCents = params.estimatedUnitPriceCents;
    this.expirationStatus = params.expirationStatus;
    this.hasExpiredLot = params.hasExpiredLot;
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
    this.quickStep = params.quickStep;
    this.restockQuantity = params.restockQuantity;
    this.shoppingListId = params.shoppingListId;
    this.stockOnly = params.stockOnly;
    this.unit = params.unit;
    this.warnDaysClosed = params.warnDaysClosed;
    this.warnDaysOpened = params.warnDaysOpened;
  }

  // API shape (camelCase, calendar days, `null` for absent optionals). Also what the repository cache stores.
  static fromJSON(data: Record<string, unknown>): StockModel {
    const lots = data.lots as Record<string, unknown>[] | undefined;

    return new StockModel({
      barcode: optionalString(data.barcode),
      brand: optionalString(data.brand),
      category: (data.category as CategoryRef | null) ?? undefined,
      categoryId: optionalString(data.categoryId),
      createdAt: optionalTimestamp(data.createdAt),
      description: data.description as string,
      effectiveShoppingListId: optionalString(data.effectiveShoppingListId),
      estimatedUnitPriceCents: optionalNumber(data.estimatedUnitPriceCents),
      expirationStatus: data.expirationStatus as string,
      hasExpiredLot: data.hasExpiredLot === true,
      hasOpenLot: data.hasOpenLot as boolean,
      id: data.id as string,
      idealQuantity: optionalNumber(data.idealQuantity),
      location: (data.location as LocationRef | null) ?? undefined,
      locationId: optionalString(data.locationId),
      lots: lots?.map((lot) => StockLotModel.fromJSON(lot)),
      minQuantity: optionalNumber(data.minQuantity),
      nearestExpiration: optionalDay(data.nearestExpiration),
      needsRestock: data.needsRestock as boolean,
      notes: optionalString(data.notes),
      openedShelfLifeDays: optionalNumber(data.openedShelfLifeDays),
      owner: data.owner as string,
      ownerId: data.ownerId as string,
      quantity: data.quantity as number,
      quickStep: optionalNumber(data.quickStep),
      restockQuantity: data.restockQuantity as number,
      shoppingListId: optionalString(data.shoppingListId),
      stockOnly: data.stockOnly as boolean,
      unit: data.unit as string,
      warnDaysClosed: data.warnDaysClosed as number,
      warnDaysOpened: data.warnDaysOpened as number,
    });
  }

  // The list carries no lots: only the list is cached.
  toJSON() {
    return {
      barcode: this.barcode ?? null,
      brand: this.brand ?? null,
      category: this.category ?? null,
      categoryId: this.categoryId ?? null,
      createdAt: this.createdAt?.toISOString() ?? null,
      description: this.description,
      effectiveShoppingListId: this.effectiveShoppingListId ?? null,
      estimatedUnitPriceCents: this.estimatedUnitPriceCents ?? null,
      expirationStatus: this.expirationStatus,
      hasExpiredLot: this.hasExpiredLot,
      hasOpenLot: this.hasOpenLot,
      id: this.id,
      idealQuantity: this.idealQuantity ?? null,
      location: this.location ?? null,
      locationId: this.locationId ?? null,
      minQuantity: this.minQuantity ?? null,
      nearestExpiration: this.nearestExpiration
        ? formatDay(this.nearestExpiration)
        : null,
      needsRestock: this.needsRestock,
      notes: this.notes ?? null,
      openedShelfLifeDays: this.openedShelfLifeDays ?? null,
      owner: this.owner,
      ownerId: this.ownerId,
      quantity: this.quantity,
      quickStep: this.quickStep ?? null,
      restockQuantity: this.restockQuantity,
      shoppingListId: this.shoppingListId ?? null,
      stockOnly: this.stockOnly,
      unit: this.unit,
      warnDaysClosed: this.warnDaysClosed,
      warnDaysOpened: this.warnDaysOpened,
    };
  }
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function optionalTimestamp(value: unknown): Date | undefined {
  return typeof value === "string" ? new Date(value) : undefined;
}

export default StockModel;
