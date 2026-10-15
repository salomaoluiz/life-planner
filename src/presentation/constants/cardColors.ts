import { TranslationKeys } from "@presentation/i18n/types";

// Stored card colors are user DATA (saved as `color`), not theme colors: this file is on the
// ignore list of the color-literal lint rule (spec 026).
interface CardColorOption {
  labelKey: TranslationKeys;
  value: string;
}

const CARD_COLORS: CardColorOption[] = [
  { labelKey: "financial.colors.indigo", value: "#6366F1" },
  { labelKey: "financial.colors.blue", value: "#3B82F6" },
  { labelKey: "financial.colors.teal", value: "#14B8A6" },
  { labelKey: "financial.colors.green", value: "#22C55E" },
  { labelKey: "financial.colors.amber", value: "#F59E0B" },
  { labelKey: "financial.colors.red", value: "#EF4444" },
  { labelKey: "financial.colors.violet", value: "#8B5CF6" },
  { labelKey: "financial.colors.slate", value: "#64748B" },
];

const DEFAULT_CARD_COLOR = CARD_COLORS[0].value;

function isCardColor(value: string): boolean {
  return CARD_COLORS.some(
    (color) => color.value.toLowerCase() === value.toLowerCase(),
  );
}

export { CARD_COLORS, DEFAULT_CARD_COLOR, isCardColor };
