import StockDTO, { StockLotDTO } from "@application/dto/stock/StockDTO";
import { formatAmount } from "@components/AmountText/formatAmount";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { StockMovementTypes } from "@domain/entities/stock/StockMovementEntity";
import { TranslationKeys } from "@presentation/i18n/types";
import { formatQuantity } from "@screens/Stock/models/quantityFormat";

export interface LotOption {
  date?: string;
  key: TranslationKeys;
  // Spec 123 FR 28: what was paid per unit of the lot, to pick the lot to discard.
  price?: { text: string; unitKey: TranslationKeys };
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

  // The Descartar form picks the lot (spec 123 FR 28); the others keep the optional automatic choice.
  get showsDiscardLot() {
    return this.type === StockMovementTypes.DISCARD;
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

  // The lot a discard starts on: the first expired one, else the first (the API sends the lots by use order).
  defaultDiscardLotId(): string | undefined {
    return (
      this.item.lots.find((lot) => lot.expirationStatus === "EXPIRED") ??
      this.item.lots[0]
    )?.id;
  }

  // The lot an OPEN with no choice picks: the closed lot that expires first (the API does the same).
  defaultOpenLot(): StockLotDTO | undefined {
    return this.item.lots.find((lot) => !lot.openedAt);
  }

  // Spec 123 FR 28: the value the discard will record when the lot has a price (the server also falls back to the
  // last price of the item, which the form does not know).
  discardValue(lotId: string | undefined, quantity: number | undefined) {
    const lot = this.lotById(lotId);

    if (!lot || !quantity || quantity <= 0) {
      return undefined;
    }

    if (lot.unitPriceCents === undefined || !lot.currency) {
      return { kind: "unknown" as const };
    }

    const currency = lot.currency as CurrencyCode;
    const tag = this.locale ?? "en-US";

    return {
      kind: "lot" as const,
      price: formatAmount(lot.unitPriceCents, tag, currency),
      quantity: formatQuantity(quantity, this.item.unit, this.locale),
      value: formatAmount(
        Math.floor(lot.unitPriceCents * quantity + 0.5),
        tag,
        currency,
      ),
    };
  }

  // Defaults the form starts with: 1 to open; to discard, the whole lot when it expired, else 1 (spec 123 FR 28).
  initialQuantity(lotId?: string): number | undefined {
    if (this.type === StockMovementTypes.OPEN) {
      return 1;
    }

    if (this.type === StockMovementTypes.DISCARD) {
      const lot = this.lotById(lotId);

      return lot?.expirationStatus === "EXPIRED"
        ? lot.quantity
        : lot && Math.min(1, lot.quantity);
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

    const price =
      lot.unitPriceCents !== undefined && lot.currency
        ? {
            text: formatAmount(
              lot.unitPriceCents,
              this.locale ?? "en-US",
              lot.currency as CurrencyCode,
            ),
            unitKey: formatQuantity(1, this.item.unit, this.locale).unitKey,
          }
        : undefined;

    if (!date) {
      return { key: "stock.movement.lotNoExpiration", price, quantity };
    }

    return {
      date,
      key: lot.openedAt
        ? "stock.movement.lotOpened"
        : "stock.movement.lotOption",
      price,
      quantity,
    };
  }
}

export default StockMovementUIModel;
