import StockAttentionDTO, {
  IStockAttentionItemDTO,
  StockAttentionStatus,
} from "@application/dto/home/StockAttentionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { TranslationKeys } from "@presentation/i18n/types";

class StockAttentionUIModel {
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

  constructor(
    private readonly dto: StockAttentionDTO,
    private readonly owners: OwnerDTO[],
  ) {}
}

export class StockAttentionRowUIModel {
  get badge(): { key: TranslationKeys; params?: { count: number } } {
    const days = this.item.daysLeft;

    if (this.isExpired) return { key: "home.stock.expired" };
    if (days === 0) return { key: "home.stock.expiresToday" };
    if (days === 1) return { key: "home.stock.expiresTomorrow" };
    return { key: "home.stock.expiresIn", params: { count: days } };
  }

  get id() {
    return this.item.stock.id;
  }

  get isExpired() {
    return this.item.status === StockAttentionStatus.EXPIRED;
  }

  get ownerName() {
    return (
      this.owners.find((owner) => owner.id === this.item.stock.ownerId)?.name ??
      ""
    );
  }

  get quantity() {
    return this.item.stock.quantity;
  }

  get title() {
    return this.item.stock.description;
  }

  get unitKey(): TranslationKeys {
    return `common.units.${this.item.stock.unit}` as TranslationKeys;
  }

  constructor(
    private readonly item: IStockAttentionItemDTO,
    private readonly owners: OwnerDTO[],
  ) {}
}

export default StockAttentionUIModel;
