import {
  RestockSummaryEntity,
  ShoppingListCardEntity,
  ShoppingListDetailEntity,
  ShoppingListEntity,
  ShoppingListGroupEntity,
  ShoppingListPriceSource,
  ShoppingListRowEntity,
  ShoppingListRowOrigins,
  ShoppingListRowResultEntity,
  ShoppingListStatuses,
} from "@domain/entities/stock/ShoppingListEntity";
import { StockUnits } from "@domain/entities/stock/StockEntity";

type Json = Record<string, unknown>;

export function parseRestockSummary(data: Json): RestockSummaryEntity {
  return {
    count: (data.count as number | undefined) ?? 0,
    groups: ((data.groups as Json[] | undefined) ?? []).map((group) => {
      const list = group.list as Json;

      return {
        list: {
          id: list.id as string,
          name: list.name as string,
          owner: list.owner as string,
          ownerName: optionalString(list.ownerName),
        },
        rows: (group.rows as Json[]).map((row) => ({
          description: row.description as string,
          quantity: row.quantity as number,
          unit: row.unit as StockUnits,
        })),
      };
    }),
    totals: ((data.totals as Json[] | undefined) ?? []).map((total) => ({
      currency: total.currency as string,
      estimatedTotalCents: total.estimatedTotalCents as number,
      pricedCount: total.pricedCount as number,
    })),
  };
}

// The API shape (camelCase, money in minor units) mapped to the domain entities (spec 118 section 7).
export function parseShoppingList(data: Json): ShoppingListEntity {
  return {
    currency: data.currency as string,
    defaultFinanceCategoryId:
      (data.defaultFinanceCategoryId as null | string | undefined) ?? undefined,
    defaultMarketId:
      (data.defaultMarketId as null | string | undefined) ?? undefined,
    id: data.id as string,
    isDefault: data.isDefault === true,
    name: data.name as string,
    owner: data.owner as string,
    ownerId: data.ownerId as string,
    status: data.status as ShoppingListStatuses,
  };
}

export function parseShoppingListCard(data: Json): ShoppingListCardEntity {
  return {
    ...parseShoppingList(data),
    autoCount: (data.autoCount as number | undefined) ?? 0,
    estimatedTotalCents: (data.estimatedTotalCents as number | undefined) ?? 0,
    pricedCount: (data.pricedCount as number | undefined) ?? 0,
    rowCount: (data.rowCount as number | undefined) ?? 0,
  };
}

export function parseShoppingListDetail(data: Json): ShoppingListDetailEntity {
  const groups = (data.groups as Json[]).map(
    (group): ShoppingListGroupEntity => {
      const category = group.category as Json | null | undefined;

      return {
        category: category
          ? {
              id: category.id as string,
              name: category.name as string,
              path: category.path as string,
            }
          : undefined,
        rows: (group.rows as Json[]).map((row) => parseShoppingListRow(row)),
        subtotalCents: (group.subtotalCents as number | undefined) ?? 0,
        unpricedCount: (group.unpricedCount as number | undefined) ?? 0,
      };
    },
  );
  const totals = data.totals as Json;

  return {
    groups,
    list: parseShoppingList(data.list as Json),
    totals: {
      autoCount: (totals.autoCount as number | undefined) ?? 0,
      estimatedTotalCents:
        (totals.estimatedTotalCents as number | undefined) ?? 0,
      pricedCount: (totals.pricedCount as number | undefined) ?? 0,
      rowCount: (totals.rowCount as number | undefined) ?? 0,
    },
  };
}

export function parseShoppingListRow(data: Json): ShoppingListRowEntity {
  const stock = data.stock as Json | null | undefined;

  return {
    description: data.description as string,
    estimateCents: optionalNumber(data.estimateCents),
    id: data.id as string,
    itemId: optionalString(data.itemId),
    origin: data.origin as ShoppingListRowOrigins,
    priceSource: data.priceSource as ShoppingListPriceSource,
    quantity: data.quantity as number,
    stock: stock
      ? {
          categoryPath: optionalString(stock.categoryPath),
          idealQuantity: optionalNumber(stock.idealQuantity),
          minQuantity: optionalNumber(stock.minQuantity),
          quantity: stock.quantity as number,
        }
      : undefined,
    unit: data.unit as StockUnits,
    unitPriceCents: optionalNumber(data.unitPriceCents),
  };
}

export function parseShoppingListRowResult(
  data: Json,
): ShoppingListRowResultEntity {
  return {
    merged: data.merged === true,
    row: parseShoppingListRow(data.row as Json),
  };
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
