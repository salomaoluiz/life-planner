import StockAttentionDTO, {
  IStockAttentionItemDTO,
  StockAttentionStatus,
} from "@application/dto/home/StockAttentionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { formatAmount, toDisplay } from "@domain/entities/stock/stockQuantity";
import { TranslationKeys } from "@presentation/i18n/types";

class StockAttentionUIModel {
  get attentionCount() {
    return this.dto.attentionCount;
  }

  get countLabelParams() {
    return { count: this.dto.totalItems };
  }

  get isEmpty() {
    return this.dto.totalItems === 0;
  }

  get isNothingExpiring() {
    return this.dto.totalItems > 0 && this.dto.items.length === 0;
  }

  get rows() {
    return this.dto.items.map(
      (item) => new StockAttentionRowUIModel(item, this.owners),
    );
  }

  get totalItems() {
    return this.dto.totalItems;
  }

  constructor(
    private readonly dto: StockAttentionDTO,
    private readonly owners: OwnerDTO[],
  ) {}
}

export class StockAttentionRowUIModel {
  get badge(): { key: TranslationKeys; params?: { count: number } } {
    const days = this.item.daysLeft ?? 0;

    if (this.isExpired) return { key: "home.stock.expired" };
    if (this.isRestock) return { key: "home.stock.restock" };
    if (days === 0) return { key: "home.stock.expiresToday" };
    if (days === 1) return { key: "home.stock.expiresTomorrow" };
    return { key: "home.stock.expiresIn", params: { count: days } };
  }

  get iconName() {
    if (this.isExpired) {
      return "alert-circle-outline";
    }

    return this.isRestock ? "cart-outline" : "clock-outline";
  }

  get id() {
    return this.item.stock.id;
  }

  get isExpired() {
    return this.item.status === StockAttentionStatus.EXPIRED;
  }

  get isRestock() {
    return this.item.status === StockAttentionStatus.RESTOCK;
  }

  get ownerName() {
    return (
      this.owners.find((owner) => owner.id === this.item.stock.ownerId)?.name ??
      ""
    );
  }

  // 500 g, 1,5 kg, 3 un (spec 116): kg and L show in g and ml below 1.
  get quantityText() {
    return formatAmount(this.display.amount);
  }

  get title() {
    return this.item.stock.description;
  }

  get unitKey(): TranslationKeys {
    return `common.units.${this.display.unitKey}` as TranslationKeys;
  }

  private get display() {
    return toDisplay(this.item.stock.quantity, this.item.stock.unit);
  }

  constructor(
    private readonly item: IStockAttentionItemDTO,
    private readonly owners: OwnerDTO[],
  ) {}
}

export default StockAttentionUIModel;
