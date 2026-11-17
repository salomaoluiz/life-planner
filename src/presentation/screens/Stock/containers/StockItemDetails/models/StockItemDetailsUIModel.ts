import StockDTO, { StockLotDTO } from "@application/dto/stock/StockDTO";
import StockMovementDTO from "@application/dto/stock/StockMovementDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockLotStatus } from "@domain/entities/stock/StockLotEntity";
import { StockMovementTypes } from "@domain/entities/stock/StockMovementEntity";
import pluralKey from "@presentation/i18n/pluralKey";
import { TranslationKeys } from "@presentation/i18n/types";
import { formatQuantity } from "@screens/Stock/models/quantityFormat";

// A tile shows quantities ("300 g · 1 kg") or a translated value ("5 days").
export interface DetailsTile {
  key: string;
  labelKey: TranslationKeys;
  value:
    | { key: TranslationKeys; params?: Record<string, unknown> }
    | { quantities: QuantityText[] };
}

export interface HistoryRow {
  createdAt: string;
  id: string;
  isPositive: boolean;
  quantity: { sign: string; text: string; unitKey: TranslationKeys };
  reasonKey?: TranslationKeys;
  titleKey: TranslationKeys;
  user?: string;
}

export interface LotRow {
  badges: Array<{
    labelKey: TranslationKeys;
    params?: Record<string, string>;
    tone: "expense" | "neutral" | "warning";
  }>;
  canDiscard: boolean;
  id: string;
  quantity: QuantityText;
  subtitle: { key: TranslationKeys; params: Record<string, string> };
}

export interface QuantityText {
  text: string;
  unitKey: TranslationKeys;
}

// The detail of one item (spec 116 FR 35): tiles, lots and history, derived from the API DTOs.
class StockItemDetailsUIModel {
  get description() {
    return this.dto.description;
  }

  get headerLine() {
    const { category, location } = this.dto;

    return [
      this.dto.brand,
      category?.path.split(" / ").join(" › "),
      location?.name,
      this.ownerName,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  get lots(): LotRow[] {
    return this.dto.lots.map((lot) => this.toLotRow(lot));
  }

  get ownerName() {
    return (
      this.owners.find((owner) => owner.id === this.dto.ownerId)?.name ?? ""
    );
  }

  get restock(): QuantityText | undefined {
    if (!this.dto.needsRestock) {
      return undefined;
    }

    return formatQuantity(this.dto.restockQuantity, this.dto.unit, this.locale);
  }

  get tiles(): DetailsTile[] {
    const { idealQuantity, minQuantity, openedShelfLifeDays } = this.dto;
    const limits = [minQuantity, idealQuantity]
      .filter((value): value is number => value !== undefined)
      .map((value) => formatQuantity(value, this.dto.unit, this.locale));

    return [
      {
        key: "total",
        labelKey: "stock.details.total",
        value: { quantities: [this.total] },
      },
      {
        key: "minIdeal",
        labelKey: "stock.details.minIdeal",
        value: limits.length
          ? { quantities: limits }
          : { key: "stock.details.notSet" },
      },
      {
        key: "afterOpening",
        labelKey: "stock.details.afterOpening",
        value:
          openedShelfLifeDays === undefined
            ? { key: "stock.details.notSet" }
            : {
                key: pluralKey("stock.details.days", openedShelfLifeDays),
                params: { count: openedShelfLifeDays },
              },
      },
      {
        key: "warnBefore",
        labelKey: "stock.details.warnBefore",
        value: {
          key: "stock.details.warnValue",
          params: {
            closed: this.dto.warnDaysClosed,
            opened: this.dto.warnDaysOpened,
          },
        },
      },
    ];
  }

  get total() {
    return formatQuantity(this.dto.quantity, this.dto.unit, this.locale);
  }

  constructor(
    private readonly dto: StockDTO,
    private readonly owners: OwnerDTO[],
    private readonly locale?: string,
  ) {}

  history(movements: StockMovementDTO[]): HistoryRow[] {
    return movements.map((movement) => this.toHistoryRow(movement));
  }

  private lotSubtitle(lot: StockLotDTO): LotRow["subtitle"] {
    const effective = lot.effectiveExpiration;

    if (!effective) {
      return { key: "stock.lots.noExpiration", params: {} };
    }

    if (lot.expirationStatus === StockLotStatus.EXPIRED) {
      return {
        key: "stock.lots.expiredAt",
        params: { date: this.shortDate(effective) },
      };
    }

    if (
      lot.openedAt &&
      lot.expirationDate &&
      effective.getTime() !== lot.expirationDate.getTime() &&
      this.dto.openedShelfLifeDays !== undefined
    ) {
      return {
        key: "stock.lots.expiresOpened",
        params: {
          date: this.shortDate(effective),
          days: String(this.dto.openedShelfLifeDays),
          original: this.shortDate(lot.expirationDate),
        },
      };
    }

    return {
      key: "stock.lots.expires",
      params: { date: this.shortDate(effective) },
    };
  }

  private shortDate(date: Date) {
    return date.toLocaleDateString(this.locale, {
      day: "2-digit",
      month: "2-digit",
    });
  }

  private toHistoryRow(movement: StockMovementDTO): HistoryRow {
    const display = formatQuantity(
      Math.abs(movement.quantity),
      this.dto.unit,
      this.locale,
    );
    const type = movement.type.toLowerCase();
    const isOpen = movement.type === StockMovementTypes.OPEN;
    const positive = isOpen ? "" : "+";
    const sign = movement.quantity < 0 ? "−" : positive;

    return {
      createdAt: movement.createdAt.toLocaleString(this.locale, {
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        month: "2-digit",
      }),
      id: movement.id,
      isPositive: movement.quantity > 0 && !isOpen,
      quantity: { sign, text: display.text, unitKey: display.unitKey },
      reasonKey: movement.reason
        ? (`stock.history.reason.${movement.reason.toLowerCase()}` as TranslationKeys)
        : undefined,
      titleKey: `stock.history.type.${type}` as TranslationKeys,
      user: movement.user?.name,
    };
  }

  private toLotRow(lot: StockLotDTO): LotRow {
    const quantity = formatQuantity(lot.quantity, this.dto.unit, this.locale);
    const badges: LotRow["badges"] = [];

    if (lot.openedAt) {
      badges.push({
        labelKey: "stock.lots.opened",
        params: { date: this.shortDate(lot.openedAt) },
        tone: "neutral",
      });
    }

    if (lot.expirationStatus === StockLotStatus.EXPIRED) {
      badges.push({ labelKey: "stock.badge.expired", tone: "expense" });
    } else if (lot.expirationStatus === StockLotStatus.EXPIRING) {
      badges.push({ labelKey: "stock.badge.expiring", tone: "warning" });
    }

    return {
      badges,
      canDiscard: lot.expirationStatus === StockLotStatus.EXPIRED,
      id: lot.id,
      quantity,
      subtitle: this.lotSubtitle(lot),
    };
  }
}

export default StockItemDetailsUIModel;
