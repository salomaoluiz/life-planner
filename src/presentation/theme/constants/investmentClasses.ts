import { InvestmentAssetClass } from "@domain/entities/investment/enums";

// Spec 110 section 8: the allocation palette, one fixed color per asset class, distinct by lightness as well as
// hue and readable in both themes (data colors, not theme tokens).
export const investmentClassColors: Record<
  "dark" | "light",
  Record<InvestmentAssetClass, string>
> = {
  dark: {
    BR_REIT: "#F5B94A",
    BR_STOCK: "#7C8CFF",
    FIXED_INCOME: "#B9C0F5",
    FOREIGN_STOCK: "#3DC9C9",
    PRIVATE: "#9AA3B2",
  },
  light: {
    BR_REIT: "#F29A4A",
    BR_STOCK: "#4F5BD5",
    FIXED_INCOME: "#A9B2F2",
    FOREIGN_STOCK: "#1C7C7D",
    PRIVATE: "#5A6273",
  },
};

// The color of a class in the current theme; unknown values fall back to the neutral gray.
export function investmentClassColor(
  isDark: boolean,
  assetClass: InvestmentAssetClass,
): string {
  const palette = isDark
    ? investmentClassColors.dark
    : investmentClassColors.light;

  return palette[assetClass] ?? palette[InvestmentAssetClass.PRIVATE];
}
