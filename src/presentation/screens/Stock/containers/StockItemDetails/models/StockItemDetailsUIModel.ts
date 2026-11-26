import StockDTO, { StockLotDTO } from "@application/dto/stock/StockDTO";
import StockMovementDTO from "@application/dto/stock/StockMovementDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { formatAmount } from "@components/AmountText/formatAmount";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import { StockLotStatus } from "@domain/entities/stock/StockLotEntity";
import { StockMovementTypes } from "@domain/entities/stock/StockMovementEntity";
import { ConsumptionWeekEntity } from "@domain/entities/stock/StockWasteEntity";
import pluralKey from "@presentation/i18n/pluralKey";
import { TranslationKeys } from "@presentation/i18n/types";
import { formatQuantity } from "@screens/Stock/models/quantityFormat";

// Spec 123 FR 19: how far a date is, as a translated phrase ("~5 days" or "now").
export interface DaysText {
  key: TranslationKeys;
  params: { count?: number };
}

// A tile shows quantities ("300 g · 1 kg") or a translated value ("5 days").
export interface DetailsTile {
  key: string;
  labelKey: TranslationKeys;
  value:
    | { key: TranslationKeys; params?: Record<string, unknown> }
    | { quantities: QuantityText[] };
}

export type ForecastSection =
  | {
      empty: { date: string; days: DaysText };
      kind: "ok";
      min: { date: string; days: DaysText; limit?: QuantityText };
      perDay: QuantityText;
      weekly: QuantityText;
    }
  | { kind: "insufficient" }
  | { kind: "noConsumption" };

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
  // Spec 123 FR 24: the tinted lot that will expire before it is used ("sobra ~1 un").
  leftover?: QuantityText;
  // The price per unit paid for the lot (spec 123 FR 26).
  price?: { text: string; unitKey: TranslationKeys };
  quantity: QuantityText;
  subtitle: { key: TranslationKeys; params: Record<string, string> };
}

export interface QuantityText {
  text: string;
  unitKey: TranslationKeys;
}

export interface WasteSection {
  count: number;
  quantity: QuantityText;
  reasonKey: TranslationKeys;
  // One text per currency, never summed.
  values: string[];
}

// One bar of the 12-week chart: `ratio` against the biggest week, `weight` 0.35-1 (recent weeks weigh more).
export interface WeekBar {
  excluded: boolean;
  key: string;
  ratio: number;
  weight: number;
}

// The detail of one item (spec 116 FR 35): tiles, lots and history, derived from the API DTOs.
class StockItemDetailsUIModel {
  get description() {
    return this.dto.description;
  }

  // Spec 123 FR 19: the "Previsão" block; items that are "stock only" have none.
  get forecast(): ForecastSection | undefined {
    const forecast = this.dto.forecast;

    if (this.dto.stockOnly || !forecast) {
      return undefined;
    }

    if (forecast.status === "INSUFFICIENT_DATA") {
      return { kind: "insufficient" };
    }

    if (forecast.status === "NO_CONSUMPTION") {
      return { kind: "noConsumption" };
    }

    if (!forecast.minDate || !forecast.emptyDate) {
      return undefined;
    }

    const { unit } = this.dto;

    return {
      empty: {
        date: this.shortDate(forecast.emptyDate),
        days: this.daysText(forecast.emptyDate),
      },
      kind: "ok",
      min: {
        date: this.shortDate(forecast.minDate),
        days: this.daysText(forecast.minDate),
        limit:
          this.dto.minQuantity === undefined
            ? undefined
            : formatQuantity(this.dto.minQuantity, unit, this.locale),
      },
      perDay: formatQuantity(forecast.dailyRate, unit, this.locale),
      weekly: formatQuantity(forecast.weeklyRate, unit, this.locale),
    };
  }

  // Spec 123 FR 19: "Entrou na lista X como previsto · N".
  get forecastRow() {
    const row = this.dto.forecastRow;

    return row
      ? {
          list: row.listName ?? "",
          quantity: formatQuantity(row.quantity, this.dto.unit, this.locale),
        }
      : undefined;
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

  // Spec 123 FR 24: the "Vai vencer antes de acabar" alert (not dismissed).
  get leftover() {
    const leftover = this.dto.leftover;
    const lot = leftover
      ? this.dto.lots.find((candidate) => candidate.id === leftover.lotId)
      : undefined;

    if (!leftover || !lot) {
      return undefined;
    }

    return {
      date: this.shortDate(leftover.date),
      left: formatQuantity(leftover.quantity, this.dto.unit, this.locale),
      lotId: lot.id,
      lotQuantity: formatQuantity(lot.quantity, this.dto.unit, this.locale),
    };
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

  // Spec 123 FR 32: "Descartado nos últimos 90 dias".
  get waste(): undefined | WasteSection {
    const waste = this.dto.waste90d;

    if (!waste) {
      return undefined;
    }

    return {
      count: waste.count,
      quantity: formatQuantity(waste.quantity, this.dto.unit, this.locale),
      reasonKey:
        `stock.waste.reason.${waste.mainReason.toLowerCase()}` as TranslationKeys,
      values: waste.totals.map((total) =>
        this.money(total.valueCents, total.currency),
      ),
    };
  }

  constructor(
    private readonly dto: StockDTO,
    private readonly owners: OwnerDTO[],
    private readonly locale?: string,
    private readonly now: Date = new Date(),
  ) {}

  // Spec 123 FR 19: the bars and the text that gives the same figures to a screen reader.
  chart(weeks: ConsumptionWeekEntity[]): {
    bars: WeekBar[];
    values: string;
  } {
    const biggest = Math.max(...weeks.map((week) => week.quantity), 0);

    return {
      bars: weeks.map((week, index) => ({
        excluded: week.excluded,
        key: week.start.toISOString(),
        ratio: biggest > 0 ? week.quantity / biggest : 0,
        weight: 0.35 + (0.65 * index) / Math.max(weeks.length - 1, 1),
      })),
      values: weeks
        .map((week) =>
          formatQuantity(week.quantity, this.dto.unit, this.locale),
        )
        .map((quantity) => quantity.text)
        .join(", "),
    };
  }

  history(movements: StockMovementDTO[]): HistoryRow[] {
    return movements.map((movement) => this.toHistoryRow(movement));
  }

  private daysText(date: Date): DaysText {
    const today = new Date(
      this.now.getFullYear(),
      this.now.getMonth(),
      this.now.getDate(),
    );
    const days = Math.max(
      0,
      Math.round((date.getTime() - today.getTime()) / 86_400_000),
    );

    return days === 0
      ? { key: "stock.forecast.now", params: {} }
      : {
          key: pluralKey("stock.forecast.inDays", days),
          params: { count: days },
        };
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

  private money(cents: number, currency: string) {
    return formatAmount(
      cents,
      this.locale ?? "en-US",
      currency as CurrencyCode,
    );
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

    const unit = formatQuantity(1, this.dto.unit, this.locale);
    const leftover =
      lot.leftoverQuantity !== undefined && !lot.leftoverDismissed
        ? formatQuantity(lot.leftoverQuantity, this.dto.unit, this.locale)
        : undefined;

    return {
      badges,
      canDiscard: lot.expirationStatus === StockLotStatus.EXPIRED,
      id: lot.id,
      leftover,
      price:
        lot.unitPriceCents !== undefined && lot.currency
          ? {
              text: this.money(lot.unitPriceCents, lot.currency),
              unitKey: unit.unitKey,
            }
          : undefined,
      quantity,
      subtitle: this.lotSubtitle(lot),
    };
  }
}

export default StockItemDetailsUIModel;
