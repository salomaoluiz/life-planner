import StockDTO from "@application/dto/stock/StockDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import {
  StockExpirationStatus,
  StockOwners,
} from "@domain/entities/stock/StockEntity";
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
  // An archived family: listed last with the archive marker (spec 042).
  archived?: boolean;
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
  // Spec 116: the category filter already includes the descendants (the screen expands them from the tree).
  categoryIds?: ReadonlySet<string>;
  filter: string;
  locationIds?: ReadonlySet<string>;
  search: string;
  sort: StockSort;
}

class StockListUIModel {
  readonly items: StockItemUIModel[];

  // The counters (Home attention, subtitle) leave out the archived families (spec 042).
  get attentionCount() {
    return this.activeItems.filter((item) => item.isAttention).length;
  }

  get total() {
    return this.activeItems.length;
  }

  private readonly archivedIds: ReadonlySet<string>;

  private readonly families: OwnerDTO[];

  private get activeItems() {
    return this.items.filter((item) => !this.archivedIds.has(item.ownerId));
  }

  constructor(dtos: StockDTO[], owners: OwnerDTO[], locale?: string) {
    this.items = dtos.map((dto) => new StockItemUIModel(dto, owners, locale));
    this.families = owners.filter((owner) => owner.type === OwnerType.FAMILY);
    this.archivedIds = new Set(
      this.families.filter((family) => family.archived).map((f) => f.id),
    );
  }

  view(params: ViewParams) {
    const query = normalizeSearchText(params.search);
    const searched = this.items.filter(
      (item) =>
        item.searchText.includes(query) &&
        matchesSet(params.categoryIds, item.categoryId) &&
        matchesSet(params.locationIds, item.locationId),
    );

    const filterOptions = this.buildFilterOptions(searched);
    const activeFilter = filterOptions.some(
      (option) => option.value === params.filter,
    )
      ? params.filter
      : StockFilters.ALL;

    const filtered = searched.filter((item) =>
      this.matches(item, activeFilter),
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
    const matches = (item: StockItemUIModel, filter: string) =>
      this.matches(item, filter);

    function count(filter: string) {
      return searched.filter((item) => matches(item, filter)).length;
    }

    return [
      {
        count: count(StockFilters.ALL),
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
      ...this.families
        .filter((family) => !family.archived)
        .map((family) => ({ label: family.name, value: family.id })),
      ...this.families
        .filter((family) => family.archived)
        .map((family) => ({
          archived: true,
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

  // Every view but an archived family's own leaves its items out (spec 042 FR 6).
  private matches(item: StockItemUIModel, filter: string) {
    const isScopeFilter = (Object.values(StockFilters) as string[]).includes(
      filter,
    );

    if (isScopeFilter && this.archivedIds.has(item.ownerId)) {
      return false;
    }

    return matchesFilter(item, filter);
  }
}

function byDescription(a: StockItemUIModel, b: StockItemUIModel) {
  return a.description.localeCompare(b.description, undefined, {
    sensitivity: "base",
  });
}

function byExpiration(a: StockItemUIModel, b: StockItemUIModel) {
  const left = a.expirationTime;
  const right = b.expirationTime;

  if (left !== undefined && right !== undefined) {
    return left - right || byDescription(a, b);
  }

  if (left === undefined && right === undefined) {
    return byDescription(a, b);
  }

  return left === undefined ? 1 : -1;
}

function byRecent(a: StockItemUIModel, b: StockItemUIModel) {
  const left = a.createdTime;
  const right = b.createdTime;

  if (left !== undefined && right !== undefined) {
    return right - left || byDescription(a, b);
  }

  if (left === undefined && right === undefined) {
    return byDescription(a, b);
  }

  return left === undefined ? 1 : -1;
}

function matchesFilter(item: StockItemUIModel, filter: string) {
  switch (filter) {
    case StockFilters.ALL:
      return true;
    case StockFilters.EXPIRED:
      return item.status === StockExpirationStatus.EXPIRED;
    case StockFilters.EXPIRING:
      // Includes expired items, matching Home's attention count
      return (
        item.status === StockExpirationStatus.EXPIRED ||
        item.status === StockExpirationStatus.EXPIRING
      );
    case StockFilters.PERSONAL:
      return item.ownerKind === StockOwners.USER;
    default:
      return item.ownerId === filter;
  }
}

function matchesSet(set: ReadonlySet<string> | undefined, value?: string) {
  return !set || set.size === 0 || (value !== undefined && set.has(value));
}

function toRows(items: StockItemUIModel[]): StockListRow[] {
  return items.map((item) => ({ id: item.id, item, kind: "item" }));
}

export default StockListUIModel;
