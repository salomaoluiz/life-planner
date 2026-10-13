import StockDTO from "@application/dto/stock/StockDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockOwners } from "@domain/entities/stock/StockEntity";
import { StockExpirationStatus } from "@domain/entities/stock/stockExpiration";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { TranslationKeys } from "@presentation/i18n/types";

import StockItemUIModel, { normalizeSearchText } from "./StockItemUIModel";

export const StockFilters = {
  ALL: "ALL",
  EXPIRED: "EXPIRED",
  EXPIRING: "EXPIRING",
  PERSONAL: "PERSONAL",
} as const;

export interface StockFilterOption {
  count?: number;
  label?: string;
  labelKey?: TranslationKeys;
  value: string;
}

export type StockListRow =
  | { id: string; item: StockItemUIModel; kind: "item" }
  | { id: string; kind: "header"; titleKey: TranslationKeys };

export type StockSort = "EXPIRATION" | "NAME" | "RECENT";

interface ViewParams {
  filter: string;
  search: string;
  sort: StockSort;
}

class StockListUIModel {
  readonly items: StockItemUIModel[];

  get attentionCount() {
    return this.items.filter((item) => item.isAttention).length;
  }

  get total() {
    return this.items.length;
  }

  private readonly families: OwnerDTO[];

  constructor(
    dtos: StockDTO[],
    owners: OwnerDTO[],
    now: Date,
    locale?: string,
  ) {
    this.items = dtos.map(
      (dto) => new StockItemUIModel(dto, owners, now, locale),
    );
    this.families = owners.filter((owner) => owner.type === OwnerType.FAMILY);
  }

  view(params: ViewParams) {
    const query = normalizeSearchText(params.search);
    const searched = this.items.filter((item) =>
      item.searchText.includes(query),
    );

    const filterOptions = this.buildFilterOptions(searched);
    const activeFilter = filterOptions.some(
      (option) => option.value === params.filter,
    )
      ? params.filter
      : StockFilters.ALL;

    const filtered = searched.filter((item) =>
      matchesFilter(item, activeFilter),
    );

    return {
      activeFilter: activeFilter as string,
      filterOptions,
      hasNoResults: this.items.length > 0 && filtered.length === 0,
      rows: this.buildRows(filtered, params.sort),
    };
  }

  private buildFilterOptions(
    searched: StockItemUIModel[],
  ): StockFilterOption[] {
    function count(filter: string) {
      return searched.filter((item) => matchesFilter(item, filter)).length;
    }

    return [
      {
        count: searched.length,
        labelKey: "stock.list.filter.all",
        value: StockFilters.ALL,
      },
      {
        count: count(StockFilters.EXPIRING),
        labelKey: "stock.list.filter.expiring",
        value: StockFilters.EXPIRING,
      },
      {
        count: count(StockFilters.EXPIRED),
        labelKey: "stock.list.filter.expired",
        value: StockFilters.EXPIRED,
      },
      { labelKey: "stock.list.filter.personal", value: StockFilters.PERSONAL },
      ...this.families.map((family) => ({
        label: family.name,
        value: family.id,
      })),
    ];
  }

  private buildRows(
    items: StockItemUIModel[],
    sort: StockSort,
  ): StockListRow[] {
    if (sort === "NAME") {
      return toRows([...items].sort(byDescription));
    }

    if (sort === "RECENT") {
      return toRows([...items].sort(byRecent));
    }

    const attention = items
      .filter((item) => item.isAttention)
      .sort(byExpiration);
    const ok = items.filter((item) => !item.isAttention).sort(byExpiration);
    const rows: StockListRow[] = [];

    if (attention.length) {
      rows.push({
        id: "header-attention",
        kind: "header",
        titleKey: "stock.list.group.attention",
      });
      rows.push(...toRows(attention));
    }

    if (ok.length) {
      rows.push({
        id: "header-ok",
        kind: "header",
        titleKey: "stock.list.group.ok",
      });
      rows.push(...toRows(ok));
    }

    return rows;
  }
}

function byDescription(a: StockItemUIModel, b: StockItemUIModel) {
  return a.description.localeCompare(b.description, undefined, {
    sensitivity: "base",
  });
}

function byExpiration(a: StockItemUIModel, b: StockItemUIModel) {
  if (a.expirationTime === undefined && b.expirationTime === undefined) {
    return byDescription(a, b);
  }

  if (a.expirationTime === undefined) {
    return 1;
  }

  if (b.expirationTime === undefined) {
    return -1;
  }

  return a.expirationTime - b.expirationTime || byDescription(a, b);
}

function byRecent(a: StockItemUIModel, b: StockItemUIModel) {
  if (a.createdTime === undefined && b.createdTime === undefined) {
    return byDescription(a, b);
  }

  if (a.createdTime === undefined) {
    return 1;
  }

  if (b.createdTime === undefined) {
    return -1;
  }

  return b.createdTime - a.createdTime || byDescription(a, b);
}

function matchesFilter(item: StockItemUIModel, filter: string) {
  switch (filter) {
    case StockFilters.ALL:
      return true;
    case StockFilters.EXPIRED:
      return item.status === StockExpirationStatus.EXPIRED;
    case StockFilters.EXPIRING:
      // Includes expired items, matching Home's attention count
      return item.isAttention;
    case StockFilters.PERSONAL:
      return item.ownerKind === StockOwners.USER;
    default:
      return item.ownerId === filter;
  }
}

function toRows(items: StockItemUIModel[]): StockListRow[] {
  return items.map((item) => ({ id: item.id, item, kind: "item" }));
}

export default StockListUIModel;
