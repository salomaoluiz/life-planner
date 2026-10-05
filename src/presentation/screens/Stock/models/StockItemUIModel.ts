import StockDTO from "@application/dto/stock/StockDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import {
  daysUntilExpiration,
  getStockExpirationStatus,
  StockExpirationStatus,
} from "@domain/entities/stock/stockExpiration";
import { TranslationKeys } from "@presentation/i18n/types";

const UnitShortKeys: Record<StockUnits, TranslationKeys> = {
  [StockUnits.GRAM]: "common.units.gram",
  [StockUnits.KILOGRAM]: "common.units.kilogram",
  [StockUnits.LITER]: "common.units.liter",
  [StockUnits.MILLILITER]: "common.units.milliliter",
  [StockUnits.UNIT]: "common.units.unit",
};

const UnitLongKeys: Record<StockUnits, TranslationKeys> = {
  [StockUnits.GRAM]: "stock.units.gram",
  [StockUnits.KILOGRAM]: "stock.units.kilogram",
  [StockUnits.LITER]: "stock.units.liter",
  [StockUnits.MILLILITER]: "stock.units.milliliter",
  [StockUnits.UNIT]: "stock.units.unit",
};

class StockItemUIModel {
  get badge():
    | undefined
    | {
        labelKey: TranslationKeys;
        params?: { count: number };
        tone: "expense" | "warning";
      } {
    if (this.status === StockExpirationStatus.EXPIRED) {
      return { labelKey: "stock.status.expired", tone: "expense" };
    }

    if (this.status !== StockExpirationStatus.EXPIRING) {
      return undefined;
    }

    if (this.days === 0) {
      return { labelKey: "stock.status.today", tone: "warning" };
    }

    if (this.days === 1) {
      return { labelKey: "stock.status.tomorrow", tone: "warning" };
    }

    return {
      labelKey: "stock.status.days",
      params: { count: this.days ?? 0 },
      tone: "warning",
    };
  }

  get brand() {
    return this.dto.brand;
  }

  get createdTime() {
    return this.dto.createdAt?.getTime();
  }

  get dateInfo(): undefined | { date: string; key: TranslationKeys } {
    if (this.status === StockExpirationStatus.EXPIRED) {
      return {
        date: this.shortDate(this.dto.expirationDate!),
        key: "stock.list.date.expired",
      };
    }

    if (this.status === StockExpirationStatus.EXPIRING) {
      return {
        date: this.shortDate(this.dto.expirationDate!),
        key: "stock.list.date.expires",
      };
    }

    if (this.dto.openingDate) {
      return {
        date: this.shortDate(this.dto.openingDate),
        key: "stock.list.date.opened",
      };
    }

    return undefined;
  }

  get description() {
    return this.dto.description;
  }

  get detailRows() {
    const rows: Array<{
      labelKey: TranslationKeys;
      value: string | undefined;
    }> = [
      { labelKey: "stock.details.owner", value: this.ownerName },
      {
        labelKey: "stock.details.expiration",
        value: this.fullDate(this.dto.expirationDate),
      },
      {
        labelKey: "stock.details.opening",
        value: this.fullDate(this.dto.openingDate),
      },
      {
        labelKey: "stock.details.purchase",
        value: this.fullDate(this.dto.purchaseDate),
      },
      { labelKey: "stock.details.brand", value: this.dto.brand },
      { labelKey: "stock.details.barcode", value: this.dto.barcode },
      { labelKey: "stock.details.notes", value: this.dto.notes },
    ];

    return rows.filter(
      (row): row is { labelKey: TranslationKeys; value: string } => !!row.value,
    );
  }

  get expirationTime() {
    return this.dto.expirationDate?.getTime();
  }

  get iconTile(): {
    icon: string;
    tone: "expense" | "neutral" | "warning";
  } {
    if (this.status === StockExpirationStatus.EXPIRED) {
      return { icon: "alert-circle-outline", tone: "expense" };
    }

    if (this.status === StockExpirationStatus.EXPIRING) {
      return { icon: "clock-outline", tone: "warning" };
    }

    return { icon: "package-variant-closed", tone: "neutral" };
  }

  get id() {
    return this.dto.id;
  }

  get isAttention() {
    return this.status !== StockExpirationStatus.OK;
  }

  get ownerId() {
    return this.dto.ownerId;
  }

  get ownerKind() {
    return this.dto.owner;
  }

  get ownerName() {
    return (
      this.owners.find((owner) => owner.id === this.dto.ownerId)?.name ?? ""
    );
  }

  get quantityDetail() {
    return { unitKey: UnitLongKeys[this.dto.unit], value: this.dto.quantity };
  }

  get quantityText() {
    return String(this.dto.quantity);
  }

  get searchText() {
    return normalizeSearchText(
      `${this.dto.description} ${this.dto.brand ?? ""}`,
    );
  }

  get status() {
    return getStockExpirationStatus(this.dto.expirationDate, this.now);
  }

  get unitKey() {
    return UnitShortKeys[this.dto.unit];
  }

  private get days() {
    return daysUntilExpiration(this.dto.expirationDate, this.now);
  }

  constructor(
    private readonly dto: StockDTO,
    private readonly owners: OwnerDTO[],
    private readonly now: Date,
    private readonly locale?: string,
  ) {}

  private fullDate(date?: Date) {
    return date?.toLocaleDateString(this.locale);
  }

  private shortDate(date: Date) {
    return date.toLocaleDateString(this.locale, {
      day: "numeric",
      month: "short",
    });
  }
}

export function normalizeSearchText(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export default StockItemUIModel;
