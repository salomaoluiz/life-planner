import StockLotModel from "@data/models/stock/StockLotModel";
import { formatDay, optionalDay } from "@domain/entities/stock/stockDay";
import {
  StockForecast,
  StockForecastRow,
  StockLeftover,
  StockWaste90d,
} from "@domain/entities/stock/StockEntity";

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
  forecast?: StockForecast;
  forecastRow?: StockForecastRow;
  hasExpiredLot: boolean;
  hasForecastRow?: boolean;
  hasOpenLot: boolean;
  id: string;
  idealQuantity?: number;
  leftover?: StockLeftover;
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
  waste90d?: StockWaste90d;
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
  forecast?: StockForecast;
  forecastRow?: StockForecastRow;
  hasExpiredLot: boolean;
  hasForecastRow?: boolean;
  hasOpenLot: boolean;
  id: string;
  idealQuantity?: number;
  leftover?: StockLeftover;
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
  waste90d?: StockWaste90d;

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
      forecast: parseForecast(data.forecast),
      forecastRow: parseForecastRow(data.forecastRow),
      hasExpiredLot: data.hasExpiredLot === true,
      hasForecastRow: data.hasForecastRow === true,
      hasOpenLot: data.hasOpenLot as boolean,
      id: data.id as string,
      idealQuantity: optionalNumber(data.idealQuantity),
      leftover: parseLeftover(data.leftover),
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
      waste90d: parseWaste90d(data.waste90d),
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
      forecast: this.forecast
        ? {
            computedOn: this.forecast.computedOn
              ? formatDay(this.forecast.computedOn)
              : null,
            dailyRate: this.forecast.dailyRate,
            emptyDate: this.forecast.emptyDate
              ? formatDay(this.forecast.emptyDate)
              : null,
            minDate: this.forecast.minDate
              ? formatDay(this.forecast.minDate)
              : null,
            status: this.forecast.status,
            weeklyRate: this.forecast.weeklyRate,
          }
        : null,
      forecastRow: this.forecastRow ?? null,
      hasExpiredLot: this.hasExpiredLot,
      hasForecastRow: this.hasForecastRow,
      hasOpenLot: this.hasOpenLot,
      id: this.id,
      idealQuantity: this.idealQuantity ?? null,
      leftover: this.leftover
        ? {
            date: formatDay(this.leftover.date),
            lotId: this.leftover.lotId,
            quantity: this.leftover.quantity,
          }
        : null,
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

function parseForecast(value: unknown): StockForecast | undefined {
  const data = value as null | Record<string, unknown> | undefined;

  if (!data) {
    return undefined;
  }

  return {
    computedOn: optionalDay(data.computedOn),
    dailyRate: (data.dailyRate as number | undefined) ?? 0,
    emptyDate: optionalDay(data.emptyDate),
    minDate: optionalDay(data.minDate),
    status: data.status as StockForecast["status"],
    weeklyRate: (data.weeklyRate as number | undefined) ?? 0,
  };
}

function parseForecastRow(value: unknown): StockForecastRow | undefined {
  const data = value as null | Record<string, unknown> | undefined;

  return data
    ? {
        listId: data.listId as string,
        listName: optionalString(data.listName),
        quantity: data.quantity as number,
      }
    : undefined;
}

function parseLeftover(value: unknown): StockLeftover | undefined {
  const data = value as null | Record<string, unknown> | undefined;
  const date = data ? optionalDay(data.date) : undefined;

  return data && date
    ? { date, lotId: data.lotId as string, quantity: data.quantity as number }
    : undefined;
}

function parseWaste90d(value: unknown): StockWaste90d | undefined {
  const data = value as null | Record<string, unknown> | undefined;

  return data
    ? {
        count: data.count as number,
        mainReason: data.mainReason as string,
        quantity: data.quantity as number,
        totals: (
          (data.totals as Record<string, unknown>[] | undefined) ?? []
        ).map((total) => ({
          currency: total.currency as string,
          valueCents: total.valueCents as number,
        })),
      }
    : undefined;
}

export default StockModel;
