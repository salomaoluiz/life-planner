import { optionalDay } from "@domain/entities/stock/stockDay";
import {
  ConsumptionWeekEntity,
  WasteCurrencyTotal,
  WasteEntity,
} from "@domain/entities/stock/StockWasteEntity";

type Json = Record<string, unknown>;

export function parseConsumptionWeeks(data: Json): ConsumptionWeekEntity[] {
  return ((data.weeks as Json[] | undefined) ?? []).map((week) => ({
    excluded: week.excluded === true,
    quantity: week.quantity as number,
    start: optionalDay(week.start) as Date,
  }));
}

export function parseWaste(data: Json): WasteEntity {
  const summary = (data.summary as Json | undefined) ?? {};

  return {
    byCategory: list(data.byCategory).map((row) => {
      const category = row.category as Json | null | undefined;

      return {
        category: category
          ? { id: category.id as string, name: category.name as string }
          : undefined,
        count: row.count as number,
        totals: totals(row.totals),
      };
    }),
    byReason: list(data.byReason).map((row) => ({
      count: row.count as number,
      reason: row.reason as string,
      totals: totals(row.totals),
    })),
    firstMonth:
      typeof data.firstMonth === "string" ? data.firstMonth : undefined,
    month: data.month as string,
    moreItemsCount: (data.moreItemsCount as number | undefined) ?? 0,
    previousMonth: list(data.previousMonth).map((row) => ({
      currency: row.currency as string,
      discardCount: row.discardCount as number,
      valueCents: row.valueCents as number,
    })),
    summary: {
      discardCount: (summary.discardCount as number | undefined) ?? 0,
      itemCount: (summary.itemCount as number | undefined) ?? 0,
      unpricedCount: (summary.unpricedCount as number | undefined) ?? 0,
    },
    topItems: list(data.topItems).map((row) => ({
      count: row.count as number,
      description: row.description as string,
      itemId: row.itemId as string,
      mainReason: row.mainReason as string,
      quantity: row.quantity as number,
      totals: totals(row.totals),
      unit: row.unit as string,
    })),
    totals: list(data.totals).map((row) => ({
      currency: row.currency as string,
      discardCount: row.discardCount as number,
      itemCount: row.itemCount as number,
      unpricedCount: (row.unpricedCount as number | undefined) ?? 0,
      valueCents: row.valueCents as number,
    })),
  };
}

function list(value: unknown): Json[] {
  return (value as Json[] | undefined) ?? [];
}

function totals(value: unknown): WasteCurrencyTotal[] {
  return list(value).map((row) => ({
    currency: row.currency as string,
    valueCents: row.valueCents as number,
  }));
}
