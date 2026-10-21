import { FilterPeriod } from "./transactionFilters";

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

function parseKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export { formatPeriod, namesLabel, parseKey };
