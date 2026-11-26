import {
  ShoppingListDetailEntity,
  ShoppingListRowEntity,
  ShoppingListRowOrigins,
} from "@domain/entities/stock/ShoppingListEntity";
import { TranslationKeys } from "@presentation/i18n/types";

export interface ShoppingGroupView {
  id: string;
  name: string;
  rows: ShoppingRowView[];
  subtotalCents: number;
  unpricedCount: number;
}

export interface ShoppingRowBadge {
  labelKey: TranslationKeys;
  testID: "badgeAuto" | "badgeEdited" | "badgeForecast" | "badgeText";
  tone: "accent" | "neutral" | "warning";
}

export interface ShoppingRowView {
  badge?: ShoppingRowBadge;
  entity: ShoppingListRowEntity;
  // Spec 123 FR 17: the projection line of a FORECAST row (the view formats the quantities and the date).
  forecast?: {
    date: Date;
    have: number;
    ideal?: number;
    min?: number;
    projected: number;
  };
  id: string;
  isText: boolean;
  // Under the name when the row has no stock line: "added by you" / "was automatic".
  noteKey?: TranslationKeys;
  // The "has 2 un · minimum 3 · ideal 8" line parts, in order (the view translates and joins them).
  stockParts: Array<{
    key: TranslationKeys;
    params: Record<string, number | string>;
  }>;
  // Spec 123 FR 34: share (0-100) of what entered that was discarded in 90 days, from 30%; the quantity never changes.
  wastePercent?: number;
}

// Spec 118 FR 19-21 and section 8: the groups of the list screen. Group "Outros" has no category and goes last (the
// API already orders them); the quantities and amounts are formatted by the view.
class ShoppingListDetailUIModel {
  readonly groups: ShoppingGroupView[];

  get isEmpty() {
    return this.detail.totals.rowCount === 0;
  }

  get rows(): ShoppingRowView[] {
    return this.groups.flatMap((group) => group.rows);
  }

  constructor(readonly detail: ShoppingListDetailEntity) {
    this.groups = detail.groups.map((group) => ({
      id: group.category?.id ?? "other",
      name: group.category?.name ?? "",
      rows: group.rows.map((row) => this.toRow(row)),
      subtotalCents: group.subtotalCents,
      unpricedCount: group.unpricedCount,
    }));
  }

  private toRow(row: ShoppingListRowEntity): ShoppingRowView {
    const stockParts: ShoppingRowView["stockParts"] = [];

    if (row.stock) {
      stockParts.push({
        key: "stock.lists.hasQuantity",
        params: { quantity: row.stock.quantity },
      });

      if (row.stock.minQuantity !== undefined) {
        stockParts.push({
          key: "stock.lists.minQuantity",
          params: { quantity: row.stock.minQuantity },
        });
      }
      if (row.stock.idealQuantity !== undefined) {
        stockParts.push({
          key: "stock.lists.idealQuantity",
          params: { quantity: row.stock.idealQuantity },
        });
      }
    }

    let noteKey: TranslationKeys | undefined;

    if (!row.itemId) {
      noteKey = "stock.lists.textHint";
    } else if (row.origin === ShoppingListRowOrigins.AUTO_EDITED) {
      noteKey = "stock.lists.wasAuto";
    } else if (row.origin === ShoppingListRowOrigins.MANUAL) {
      noteKey = "stock.lists.manualRow";
    }

    return {
      badge: badgeOf(row),
      entity: row,
      forecast:
        row.forecast && row.stock
          ? {
              date: row.forecast.nextTripDate,
              have: row.stock.quantity,
              ideal: row.stock.idealQuantity,
              min: row.stock.minQuantity,
              projected: row.forecast.projectedOnTrip,
            }
          : undefined,
      id: row.id,
      isText: !row.itemId,
      noteKey,
      stockParts,
      wastePercent:
        row.wasteRatio90d !== undefined && row.wasteRatio90d >= WASTE_HINT_RATIO
          ? Math.round(row.wasteRatio90d * 100)
          : undefined,
    };
  }
}

const WASTE_HINT_RATIO = 0.3;

function badgeOf(row: ShoppingListRowEntity): ShoppingRowBadge | undefined {
  if (row.origin === ShoppingListRowOrigins.FORECAST) {
    return {
      labelKey: "stock.lists.badge.forecast",
      testID: "badgeForecast",
      tone: "warning",
    };
  }

  if (row.origin === ShoppingListRowOrigins.AUTO) {
    return {
      labelKey: "stock.lists.badge.auto",
      testID: "badgeAuto",
      tone: "accent",
    };
  }

  if (row.origin === ShoppingListRowOrigins.AUTO_EDITED) {
    return {
      labelKey: "stock.lists.badge.edited",
      testID: "badgeEdited",
      tone: "neutral",
    };
  }

  return row.itemId
    ? undefined
    : {
        labelKey: "stock.lists.badge.text",
        testID: "badgeText",
        tone: "warning",
      };
}

export default ShoppingListDetailUIModel;
