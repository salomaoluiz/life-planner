import StockDTO, { StockLotDTO } from "@application/dto/stock/StockDTO";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { StockMovementTypes } from "@domain/entities/stock/StockMovementEntity";
import { TranslationKeys } from "@presentation/i18n/types";
import { formatQuantity } from "@screens/Stock/models/quantityFormat";

export interface LotOption {
  date?: string;
  key: TranslationKeys;
  quantity: { text: string; unitKey: TranslationKeys };
  value: string;
}

// What a movement form shows and asks for, per type (spec 116 FR 12-17); the rules run on the server.
class StockMovementUIModel {
  get description() {
    return this.item.description;
  }

  get hasOpenLot() {
    return this.item.lots.some((lot) => lot.openedAt);
  }

  get lotOptions(): LotOption[] {
    return this.item.lots
      .filter((lot) => this.isSelectable(lot))
      .map((lot) => ({ ...this.lotLabel(lot), value: lot.id }));
  }

  get nextOpenExpiration() {
    return this.item.lots.find((lot) => lot.openedAt)?.effectiveExpiration;
  }

  get quantityLabelKey() {
    return `stock.movement.quantity.${this.type.toLowerCase()}` as TranslationKeys;
  }

  get reasonOptions() {
    const reasons =
      this.type === StockMovementTypes.DISCARD
        ? ["EXPIRED", "SPOILED", "OTHER"]
        : ["PURCHASE", "MANUAL"];

    return reasons.map((value) => ({
      labelKey:
        `stock.movement.reasonOption.${value.toLowerCase()}` as TranslationKeys,
      value,
    }));
  }

  get showsExpiration() {
    return this.type === StockMovementTypes.ENTRY;
  }

  get showsLot() {
    return (
      this.type === StockMovementTypes.CONSUME ||
      this.type === StockMovementTypes.OPEN ||
      this.type === StockMovementTypes.ADJUST
    );
  }

  get showsReason() {
    return (
      this.type === StockMovementTypes.ENTRY ||
      this.type === StockMovementTypes.DISCARD
    );
  }

  get unit(): StockUnits {
    return this.item.unit;
  }

  constructor(
    private readonly item: StockDTO,
    readonly type: StockMovementTypes,
    private readonly locale?: string,
  ) {}

  // The lot an OPEN with no choice picks: the closed lot that expires first (the API does the same).
  defaultOpenLot(): StockLotDTO | undefined {
    return this.item.lots.find((lot) => !lot.openedAt);
  }

  // Defaults the form starts with: 1 to open, the whole lot to discard.
  initialQuantity(lotId?: string): number | undefined {
    if (this.type === StockMovementTypes.OPEN) {
      return 1;
    }

    if (this.type === StockMovementTypes.DISCARD) {
      return this.lotById(lotId)?.quantity;
    }

    return undefined;
  }

  lotById(id?: string) {
    return this.item.lots.find((lot) => lot.id === id);
  }

  // Before / after the lot of an OPEN (the artboard "Abri"): what stays closed and what becomes open.
  openPreview(lotId: string | undefined, quantity: number | undefined) {
    const lot = lotId ? this.lotById(lotId) : this.defaultOpenLot();

    if (!lot || !quantity || quantity <= 0) {
      return undefined;
    }

    const opened = Math.min(quantity, lot.quantity);
    const rest = Math.round((lot.quantity - opened) * 1000) / 1000;

    return {
      before: formatQuantity(lot.quantity, this.item.unit, this.locale),
      opened: formatQuantity(opened, this.item.unit, this.locale),
      rest:
        rest > 0
          ? formatQuantity(rest, this.item.unit, this.locale)
          : undefined,
    };
  }

  private isSelectable(lot: StockLotDTO) {
    if (this.type === StockMovementTypes.OPEN) {
      return !lot.openedAt;
    }

    return true;
  }

  private lotLabel(lot: StockLotDTO): Omit<LotOption, "value"> {
    const quantity = formatQuantity(lot.quantity, this.item.unit, this.locale);
    const date = lot.effectiveExpiration?.toLocaleDateString(this.locale, {
      day: "2-digit",
      month: "2-digit",
    });

    if (!date) {
      return { key: "stock.movement.lotNoExpiration", quantity };
    }

    return {
      date,
      key: lot.openedAt
        ? "stock.movement.lotOpened"
        : "stock.movement.lotOption",
      quantity,
    };
  }
}

export default StockMovementUIModel;
