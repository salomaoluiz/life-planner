import { TranslationKeys } from "@presentation/i18n/types";

// Stored category colors are user DATA (saved as `iconColor`), not theme colors:
// this file is on the ignore list of the color-literal lint rule (spec 013).
interface CategoryColorOption {
  labelKey: TranslationKeys;
  value: string;
}

const CATEGORY_COLORS: CategoryColorOption[] = [
  { labelKey: "financial.colors.amber", value: "#F59E0B" },
  { labelKey: "financial.colors.yellow", value: "#EAB308" },
  { labelKey: "financial.colors.orange", value: "#F97316" },
  { labelKey: "financial.colors.red", value: "#EF4444" },
  { labelKey: "financial.colors.rose", value: "#F43F5E" },
  { labelKey: "financial.colors.pink", value: "#EC4899" },
  { labelKey: "financial.colors.fuchsia", value: "#D946EF" },
  { labelKey: "financial.colors.purple", value: "#A855F7" },
  { labelKey: "financial.colors.violet", value: "#8B5CF6" },
  { labelKey: "financial.colors.indigo", value: "#6366F1" },
  { labelKey: "financial.colors.blue", value: "#3B82F6" },
  { labelKey: "financial.colors.sky", value: "#0EA5E9" },
  { labelKey: "financial.colors.cyan", value: "#06B6D4" },
  { labelKey: "financial.colors.teal", value: "#14B8A6" },
  { labelKey: "financial.colors.emerald", value: "#10B981" },
  { labelKey: "financial.colors.green", value: "#22C55E" },
  { labelKey: "financial.colors.lime", value: "#84CC16" },
  { labelKey: "financial.colors.brown", value: "#A16207" },
  { labelKey: "financial.colors.slate", value: "#64748B" },
];

const DEFAULT_CATEGORY_COLOR = "#6366F1";
const LEGACY_BLACK = "#000000";
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function isHexColor(value: string): boolean {
  return HEX_COLOR.test(value);
}

function isPaletteColor(value: string): boolean {
  return CATEGORY_COLORS.some(
    (color) => color.value.toLowerCase() === value.toLowerCase(),
  );
}

// Old data uses the "black" token; the API stores #000000.
function normalizeCategoryColor(color: string): string {
  return color === "black" ? LEGACY_BLACK : color;
}

export type { CategoryColorOption };
// What a category created from the CSV import wizard starts with (spec 047 FR 25): the user can edit it later.
const IMPORTED_CATEGORY_DEFAULTS = {
  icon: "shape-outline",
  iconColor: DEFAULT_CATEGORY_COLOR,
};

export {
  CATEGORY_COLORS,
  DEFAULT_CATEGORY_COLOR,
  IMPORTED_CATEGORY_DEFAULTS,
  isHexColor,
  isPaletteColor,
  LEGACY_BLACK,
  normalizeCategoryColor,
};
