import { TranslationKeys } from "@presentation/i18n/types";

// Stored category colors are user DATA (saved as `iconColor`), not theme colors:
// this file is on the ignore list of the color-literal lint rule (spec 013).
interface CategoryColorOption {
  labelKey: TranslationKeys;
  value: string;
}

const CATEGORY_COLORS: CategoryColorOption[] = [
  { labelKey: "financial.colors.amber", value: "#F59E0B" },
  { labelKey: "financial.colors.orange", value: "#F97316" },
  { labelKey: "financial.colors.red", value: "#EF4444" },
  { labelKey: "financial.colors.pink", value: "#EC4899" },
  { labelKey: "financial.colors.violet", value: "#8B5CF6" },
  { labelKey: "financial.colors.indigo", value: "#6366F1" },
  { labelKey: "financial.colors.blue", value: "#3B82F6" },
  { labelKey: "financial.colors.cyan", value: "#06B6D4" },
  { labelKey: "financial.colors.teal", value: "#14B8A6" },
  { labelKey: "financial.colors.green", value: "#22C55E" },
  { labelKey: "financial.colors.lime", value: "#84CC16" },
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
export {
  CATEGORY_COLORS,
  DEFAULT_CATEGORY_COLOR,
  isHexColor,
  isPaletteColor,
  LEGACY_BLACK,
  normalizeCategoryColor,
};
