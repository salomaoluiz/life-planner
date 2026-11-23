import {
  PurchaseRowEntity,
  PurchaseRowStates,
  PurchaseViewEntity,
} from "@domain/entities/stock/PurchaseEntity";
import { ShoppingListDetailEntity } from "@domain/entities/stock/ShoppingListEntity";
import { StockUnits } from "@domain/entities/stock/StockEntity";

// Spec 120 FR 20: the badge shows from this percent, either way.
export const PRICE_CHANGE_NOTICE_PERCENT = 5;

export interface CartRow {
  checkedByName?: string;
  description: string;
  expirationDate?: string;
  id: string;
  lineTotalCents?: number;
  listRowId?: string;
  outsideList: boolean;
  pending: boolean;
  priceChange: PriceChange;
  priceChangePercent?: number;
  quantity?: number;
  unit?: StockUnits;
  unitPriceCents?: number;
  unknownWeightOrPrice: boolean;
}

export type PriceChange = "CHEAPER" | "NONE" | "UP";

export interface PurchaseModel {
  cart: CartRow[];
  toBuy: ToBuyRow[];
}

export interface ToBuyRow {
  categoryPath?: string;
  description: string;
  id: string;
  lastUnitPriceCents?: number;
  listRowId: string;
  notFound?: boolean;
  // "no carrinho de <name> (<market>)": read-only here (FR 18).
  otherCart?: { marketName: string; userName: string };
  // The id of the purchase row when this list row is "Não tinha".
  purchaseRowId?: string;
  quantity: number;
  unit: StockUnits;
}

// Spec 120 FR 12 and 18: the rows of the list that are not in the cart "a comprar" (read-only when another open
// purchase has them), and the rows of this purchase "no carrinho". `overlay` holds the writes still queued.
export function buildPurchaseModel(input: {
  detail?: ShoppingListDetailEntity;
  overlay?: Map<string, PurchaseRowEntity | undefined>;
  pending?: Set<string>;
  view: PurchaseViewEntity;
}): PurchaseModel {
  const pending = input.pending ?? new Set<string>();
  const rowsById = new Map(input.view.rows.map((row) => [row.id, row]));

  for (const [id, row] of input.overlay ?? []) {
    if (row) {
      rowsById.set(id, row);
    } else {
      rowsById.delete(id);
    }
  }

  const rows = [...rowsById.values()];
  const inCart = rows.filter((row) => row.state === PurchaseRowStates.IN_CART);
  const notFound = new Map(
    rows
      .filter((row) => row.state === PurchaseRowStates.NOT_FOUND)
      .map((row) => [row.listRowId, row.id]),
  );
  const taken = new Set(inCart.map((row) => row.listRowId));
  const others = new Map(
    input.view.otherCarts.map((cart) => [cart.listRowId, cart]),
  );
  const toBuy: ToBuyRow[] = [];

  for (const group of input.detail?.groups ?? []) {
    for (const row of group.rows) {
      if (taken.has(row.id)) {
        continue;
      }

      const other = others.get(row.id);

      toBuy.push({
        categoryPath: group.category?.path,
        description: row.description,
        id: row.id,
        lastUnitPriceCents: row.unitPriceCents,
        listRowId: row.id,
        notFound: notFound.has(row.id),
        otherCart: other
          ? { marketName: other.marketName, userName: other.userName }
          : undefined,
        purchaseRowId: notFound.get(row.id),
        quantity: row.quantity,
        unit: row.unit,
      });
    }
  }

  return {
    cart: inCart.map((row) => toCartRow(row, pending)),
    toBuy: toBuy.sort(
      (left, right) =>
        Number(left.notFound ?? false) - Number(right.notFound ?? false),
    ),
  };
}

export function priceChangeOf(percent?: number): PriceChange {
  if (percent === undefined) {
    return "NONE";
  }
  if (percent >= PRICE_CHANGE_NOTICE_PERCENT) {
    return "UP";
  }

  return percent <= -PRICE_CHANGE_NOTICE_PERCENT ? "CHEAPER" : "NONE";
}

function toCartRow(row: PurchaseRowEntity, pending: Set<string>): CartRow {
  const hasPrice = row.lineTotalCents !== undefined;
  const hasQuantity = row.quantity !== undefined;

  return {
    checkedByName: row.checkedBy?.name,
    description: row.description,
    expirationDate: row.expirationDate,
    id: row.id,
    lineTotalCents: row.lineTotalCents,
    listRowId: row.listRowId,
    outsideList: row.listRowId === undefined,
    pending: pending.has(row.id),
    priceChange: priceChangeOf(row.priceChangePercent),
    priceChangePercent: row.priceChangePercent,
    quantity: row.quantity,
    unit: row.unit,
    unitPriceCents: row.unitPriceCents,
    unknownWeightOrPrice:
      !hasPrice && (!hasQuantity || row.unitPriceCents === undefined),
  };
}
