import StockDTO from "@application/dto/stock/StockDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockExpirationStatus } from "@domain/entities/stock/StockEntity";
import { TranslationKeys } from "@presentation/i18n/types";

import { formatQuantity } from "./quantityFormat";

export interface StockBadge {
  labelKey: TranslationKeys;
  tone: StockBadgeTone;
}

export type StockBadgeTone = "accent" | "expense" | "neutral" | "warning";

class StockItemUIModel {
  // Spec 116 FR 34: Vencido / Vencendo, Repor and Aberto; text, never color alone.
  get badges(): StockBadge[] {
    const badges: StockBadge[] = [];

    if (this.status === StockExpirationStatus.EXPIRED) {
      badges.push({ labelKey: "stock.badge.expired", tone: "expense" });
    } else if (this.status === StockExpirationStatus.EXPIRING) {
      badges.push({ labelKey: "stock.badge.expiring", tone: "warning" });
    }

    if (this.dto.needsRestock) {
      badges.push({ labelKey: "stock.badge.restock", tone: "accent" });
    }

    if (this.dto.hasOpenLot) {
      badges.push({ labelKey: "stock.badge.opened", tone: "neutral" });
    }

    return badges;
  }

  get brand() {
    return this.dto.brand;
  }

  // Spec 117 FR 12: "Abri" shows only with a shelf life, no open lot and something in stock.
  get canOpen() {
    return (
      this.dto.openedShelfLifeDays !== undefined &&
      !this.dto.hasOpenLot &&
      this.dto.quantity > 0
    );
  }

  get categoryId() {
    return this.dto.categoryId;
  }

  get createdTime() {
    return this.dto.createdAt?.getTime();
  }

  // The nearest expiration, or the minimum when the item only asks to be restocked.
  get dateInfo():
    | undefined
    | {
        date?: string;
        key: TranslationKeys;
        minimum?: { text: string; unitKey: TranslationKeys };
      } {
    const { nearestExpiration } = this.dto;

    if (nearestExpiration) {
      const date = this.shortDate(nearestExpiration);

      if (this.status === StockExpirationStatus.EXPIRED) {
        return { date, key: "stock.list.date.expired" };
      }

      return {
        date,
        key: this.dto.hasOpenLot
          ? "stock.list.date.openedExpires"
          : "stock.list.date.expires",
      };
    }

    if (this.dto.needsRestock && this.dto.minQuantity !== undefined) {
      return {
        key: "stock.list.date.minimum",
        minimum: formatQuantity(
          this.dto.minQuantity,
          this.dto.unit,
          this.locale,
        ),
      };
    }

    return undefined;
  }

  get description() {
    return this.dto.description;
  }

  get expirationTime() {
    return this.dto.nearestExpiration?.getTime();
  }

  get iconTile(): {
    icon: string;
    tone: "accent" | "expense" | "neutral" | "warning";
  } {
    if (this.status === StockExpirationStatus.EXPIRED) {
      return { icon: "alert-circle-outline", tone: "expense" };
    }

    if (this.status === StockExpirationStatus.EXPIRING) {
      return { icon: "clock-outline", tone: "warning" };
    }

    if (this.dto.needsRestock) {
      return { icon: "cart-outline", tone: "accent" };
    }

    return { icon: "package-variant-closed", tone: "neutral" };
  }

  get id() {
    return this.dto.id;
  }

  // Needs attention: a date warning or a low quantity.
  get isAttention() {
    return (
      this.status === StockExpirationStatus.EXPIRED ||
      this.status === StockExpirationStatus.EXPIRING ||
      this.dto.needsRestock
    );
  }

  // Spec 117 FR 2: an archived family's items show the quantity without buttons.
  get isReadOnly() {
    return (
      this.owners.find((owner) => owner.id === this.dto.ownerId)?.archived ===
      true
    );
  }

  get locationId() {
    return this.dto.locationId;
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

  get quantity() {
    return formatQuantity(this.dto.quantity, this.dto.unit, this.locale);
  }

  // The item as the API sent it (the quick movement needs unit, owner and step).
  get raw() {
    return this.dto;
  }

  get searchText() {
    return normalizeSearchText(
      `${this.dto.description} ${this.dto.brand ?? ""} ${this.dto.barcode ?? ""}`,
    );
  }

  get status() {
    return this.dto.expirationStatus;
  }

  // "Laticínios › Leite · Geladeira · Família" (category path, location and owner).
  get subtitle() {
    const { category, location } = this.dto;

    return [
      category?.path.split(" / ").join(" › "),
      location?.name,
      this.ownerName,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  constructor(
    private readonly dto: StockDTO,
    private readonly owners: OwnerDTO[],
    private readonly locale?: string,
  ) {}

  // Any quantity of this item formatted in its unit (the stepper shows the optimistic one).
  quantityFor(quantity: number) {
    return formatQuantity(quantity, this.dto.unit, this.locale);
  }

  private shortDate(date: Date) {
    return date.toLocaleDateString(this.locale, {
      day: "2-digit",
      month: "2-digit",
    });
  }
}

export function normalizeSearchText(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export default StockItemUIModel;
