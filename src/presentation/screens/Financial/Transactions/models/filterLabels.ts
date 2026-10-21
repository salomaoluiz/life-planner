import { TranslationKeys } from "@presentation/i18n/types";

import {
  FilterGroup,
  FilterPeriod,
  TransactionFilters,
} from "./transactionFilters";

export interface ActiveFilterChip {
  group: FilterGroup;
  label: string;
}

// What the chips need to name the ids of a filter; an id nobody can see keeps its chip (spec 045 FR 17).
export interface FilterNames {
  categories: Map<string, string>;
  sources: Map<string, string>;
  tags: Map<string, string>;
}

// One removable chip per active group, in the order of the badge (spec 045 FR 11).
function buildActiveChips(
  filters: TransactionFilters,
  names: FilterNames,
  localeTag: string,
  t: (key: TranslationKeys, params?: Record<string, string>) => string,
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (filters.period) {
    chips.push({
      group: "period",
      label: t("financial.transactions.filters.chip.period", {
        range: formatPeriod(filters.period, localeTag),
      }),
    });
  }
  if (filters.origin) {
    chips.push({
      group: "origin",
      label: t(
        filters.origin === "ACCOUNT"
          ? "financial.transactions.filters.origin.account"
          : "financial.transactions.filters.origin.card",
      ),
    });
  }
  if (filters.accountIds.length + filters.cardIds.length > 0) {
    chips.push({
      group: "sources",
      label: t("financial.transactions.filters.chip.sources", {
        names: namesLabel(
          namesOf([...filters.accountIds, ...filters.cardIds], names.sources),
        ),
      }),
    });
  }
  if (filters.categoryIds.length > 0) {
    chips.push({
      group: "categories",
      label: t("financial.transactions.filters.chip.categories", {
        names: namesLabel(namesOf(filters.categoryIds, names.categories)),
      }),
    });
  }
  if (filters.tagIds.length > 0) {
    chips.push({
      group: "tags",
      label: t("financial.transactions.filters.chip.tags", {
        names: namesLabel(namesOf(filters.tagIds, names.tags)),
      }),
    });
  }
  if (filters.situation) {
    chips.push({
      group: "situation",
      label: t(
        filters.situation === "PAID"
          ? "financial.transactions.filters.situation.paid"
          : "financial.transactions.filters.situation.unpaid",
      ),
    });
  }

  return chips;
}

// "01/01/2025 – 28/02/2026" in the active language.
function formatPeriod(period: FilterPeriod, localeTag: string) {
  const formatter = new Intl.DateTimeFormat(localeTag);

  return `${formatter.format(parseKey(period.from))} – ${formatter.format(parseKey(period.to))}`;
}

// "Mercado, Farmácia" for up to two names, "Mercado +2" for more (spec 045 FR 11).
function namesLabel(names: string[]) {
  if (names.length <= 2) {
    return names.join(", ");
  }

  return `${names[0]} +${names.length - 1}`;
}

function namesOf(ids: string[], names: Map<string, string>) {
  const found: string[] = [];

  ids.forEach((id) => {
    const name = names.get(id) ?? "…";

    if (!found.some((item) => item.toLowerCase() === name.toLowerCase())) {
      found.push(name);
    }
  });

  return found;
}

function parseKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export { buildActiveChips, formatPeriod, namesLabel, parseKey };
