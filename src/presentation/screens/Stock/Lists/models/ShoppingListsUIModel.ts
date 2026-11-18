import OwnerDTO from "@application/dto/user/OwnerDTO";
import {
  ShoppingListCardEntity,
  ShoppingListStatuses,
} from "@domain/entities/stock/ShoppingListEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { TranslationKeys } from "@presentation/i18n/types";

export const LISTS_FILTER_ALL = "ALL";
export const LISTS_FILTER_PERSONAL = "PERSONAL";

export interface ShoppingListCardView {
  autoCount: number;
  currency: string;
  estimatedTotalCents: number;
  id: string;
  isDefault: boolean;
  name: string;
  // Undefined for the personal lists (the filter chip already says "Pessoal").
  ownerName?: string;
  pricedCount: number;
  rowCount: number;
}

export interface ShoppingListsFilterOption {
  label?: string;
  labelKey?: TranslationKeys;
  value: string;
}

// Spec 118 FR 25 and section 8: the owner chips, the active cards and the archived ones. Archived families leave the
// view (their lists are hidden from "Todas" and are read-only).
class ShoppingListsUIModel {
  // The number the "Listas" menu entry shows: the rows the stock asked for, across the readable lists.
  get autoRows() {
    return this.cards
      .filter((card) => card.status === ShoppingListStatuses.ACTIVE)
      .reduce((sum, card) => sum + card.autoCount, 0);
  }

  get filterOptions(): ShoppingListsFilterOption[] {
    return [
      { labelKey: "stock.lists.filters.all", value: LISTS_FILTER_ALL },
      {
        labelKey: "stock.lists.filters.personal",
        value: LISTS_FILTER_PERSONAL,
      },
      ...this.activeFamilies.map((family) => ({
        label: family.name,
        value: family.id,
      })),
    ];
  }

  private readonly activeFamilies: OwnerDTO[];

  constructor(
    readonly cards: ShoppingListCardEntity[],
    private readonly owners: OwnerDTO[],
  ) {
    this.activeFamilies = owners.filter(
      (owner) => owner.type === OwnerType.FAMILY && !owner.archived,
    );
  }

  view(filter: string) {
    const visible = this.cards.filter((card) => this.matches(card, filter));

    return {
      active: visible
        .filter((card) => card.status === ShoppingListStatuses.ACTIVE)
        .map((card) => this.toView(card)),
      archived: visible
        .filter((card) => card.status === ShoppingListStatuses.ARCHIVED)
        .map((card) => this.toView(card)),
      // A filter that no owner has any more (a family left) falls back to "Todas".
      filter: this.filterOptions.some((option) => option.value === filter)
        ? filter
        : LISTS_FILTER_ALL,
    };
  }

  private matches(card: ShoppingListCardEntity, filter: string) {
    const owner = this.owners.find(
      (candidate) => candidate.id === card.ownerId,
    );

    if (owner?.archived) {
      return false;
    }

    if (filter === LISTS_FILTER_ALL) {
      return true;
    }

    return filter === LISTS_FILTER_PERSONAL
      ? card.owner === OwnerType.USER
      : card.ownerId === filter;
  }

  private toView(card: ShoppingListCardEntity): ShoppingListCardView {
    const owner = this.owners.find(
      (candidate) => candidate.id === card.ownerId,
    );

    return {
      autoCount: card.autoCount,
      currency: card.currency,
      estimatedTotalCents: card.estimatedTotalCents,
      id: card.id,
      isDefault: card.isDefault,
      name: card.name,
      ownerName: card.owner === OwnerType.FAMILY ? owner?.name : undefined,
      pricedCount: card.pricedCount,
      rowCount: card.rowCount,
    };
  }
}

export default ShoppingListsUIModel;
