import { RestockSummaryEntity } from "@domain/entities/stock/ShoppingListEntity";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { TranslationKeys } from "@presentation/i18n/types";
import { formatQuantity } from "@screens/Stock/models/quantityFormat";

export interface ShoppingSummaryGroup {
  id: string;
  rows: ShoppingSummaryRow[];
  title: string;
}

export interface ShoppingSummaryRow {
  description: string;
  quantityText: string;
  unitKey: TranslationKeys;
}

// Spec 118 FR 26: the Home card with what the stock asked for (AUTO rows of every readable list, at most 5 listed).
class ShoppingListSummaryUIModel {
  readonly groups: ShoppingSummaryGroup[];

  get count() {
    return this.dto.count;
  }

  // The card is not shown without automatic rows.
  get isEmpty() {
    return this.dto.count === 0;
  }

  get remaining() {
    const shown = this.groups.reduce(
      (sum, group) => sum + group.rows.length,
      0,
    );

    return Math.max(this.dto.count - shown, 0);
  }

  // Money is shown per currency, never summed across them.
  get totals() {
    return this.dto.totals;
  }

  constructor(
    private readonly dto: RestockSummaryEntity,
    languageTag: string,
  ) {
    this.groups = dto.groups.map((group) => ({
      id: group.list.id,
      rows: group.rows.map((row) => {
        const display = formatQuantity(
          row.quantity,
          row.unit as StockUnits,
          languageTag,
        );

        return {
          description: row.description,
          quantityText: display.text,
          unitKey: display.unitKey,
        };
      }),
      title: group.list.ownerName
        ? `${group.list.name} · ${group.list.ownerName}`
        : group.list.name,
    }));
  }
}

export default ShoppingListSummaryUIModel;
