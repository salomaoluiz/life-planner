import { TranslationKeys } from "@presentation/i18n/types";

// Spec 125 FR 13: defaults when nothing else applies. Stored colors are user data (like the category palette).
const DEFAULT_CATALOG_COLOR = "#8A8F98";
const DEFAULT_CATALOG_ICON = "package-variant";

interface CatalogSuggestion {
  // The stable key the API takes in `keys` (spec 125 section 6).
  color: string;
  icon: string;
  key: string;
  nameKey: TranslationKeys;
}

// Stored colors are user data (like the category palette): same table as the backend suggestions.
const CATEGORY_SUGGESTIONS: CatalogSuggestion[] = [
  {
    color: "#F59E0B",
    icon: "cart",
    key: "GROCERIES",
    nameKey: "stock.catalog.suggestions.GROCERIES",
  },
  {
    color: "#22C55E",
    icon: "leaf",
    key: "PRODUCE",
    nameKey: "stock.catalog.suggestions.PRODUCE",
  },
  {
    color: "#60A5FA",
    icon: "cup",
    key: "DAIRY",
    nameKey: "stock.catalog.suggestions.DAIRY",
  },
  {
    color: "#EF4444",
    icon: "food-drumstick",
    key: "MEAT",
    nameKey: "stock.catalog.suggestions.MEAT",
  },
  {
    color: "#3B82F6",
    icon: "bottle-soda",
    key: "DRINKS",
    nameKey: "stock.catalog.suggestions.DRINKS",
  },
  {
    color: "#14B8A6",
    icon: "spray-bottle",
    key: "CLEANING",
    nameKey: "stock.catalog.suggestions.CLEANING",
  },
  {
    color: "#8B5CF6",
    icon: "toothbrush",
    key: "HYGIENE",
    nameKey: "stock.catalog.suggestions.HYGIENE",
  },
  {
    color: "#EC4899",
    icon: "pill",
    key: "PHARMACY",
    nameKey: "stock.catalog.suggestions.PHARMACY",
  },
  {
    color: "#8A8F98",
    icon: "hammer-wrench",
    key: "HOME_TOOLS",
    nameKey: "stock.catalog.suggestions.HOME_TOOLS",
  },
];
const LOCATION_SUGGESTIONS: CatalogSuggestion[] = [
  {
    color: "#F59E0B",
    icon: "archive",
    key: "PANTRY",
    nameKey: "stock.catalog.suggestions.PANTRY",
  },
  {
    color: "#3B82F6",
    icon: "fridge",
    key: "FRIDGE",
    nameKey: "stock.catalog.suggestions.FRIDGE",
  },
  {
    color: "#60A5FA",
    icon: "snowflake",
    key: "FREEZER",
    nameKey: "stock.catalog.suggestions.FREEZER",
  },
  {
    color: "#14B8A6",
    icon: "washing-machine",
    key: "LAUNDRY",
    nameKey: "stock.catalog.suggestions.LAUNDRY",
  },
  {
    color: "#8A8F98",
    icon: "garage",
    key: "GARAGE",
    nameKey: "stock.catalog.suggestions.GARAGE",
  },
];

// The appearance fields of the API payloads (screens do not write `color:` keys themselves).
function appearanceFields(
  color: string,
  icon: string,
): { color: string; icon: string } {
  return { color, icon };
}

// All checked except the keys the user unchecked (FR 24).
function selectedKeys(
  suggestions: CatalogSuggestion[],
  unchecked: readonly string[],
): string[] {
  return suggestions
    .map((suggestion) => suggestion.key)
    .filter((key) => !unchecked.includes(key));
}

export type { CatalogSuggestion };
export {
  appearanceFields,
  CATEGORY_SUGGESTIONS,
  DEFAULT_CATALOG_COLOR,
  DEFAULT_CATALOG_ICON,
  LOCATION_SUGGESTIONS,
  selectedKeys,
};
