// Slice colours of the investments overview, one per asset class, for each theme (spec 110). Like `chartPalette` they
// are data, not theme tokens. Each class also differs in lightness (not hue alone) inside its theme.
export const investmentClassPalette = {
  dark: {
    BR_REIT: "#F7BC82",
    BR_STOCK: "#7A86F0",
    FIXED_INCOME: "#E4E8FC",
    FOREIGN_STOCK: "#2FBDBE",
    PRIVATE: "#5F6980",
  },
  light: {
    BR_REIT: "#F29A4A",
    BR_STOCK: "#4F5BD5",
    FIXED_INCOME: "#C3C9F7",
    FOREIGN_STOCK: "#1E9B9C",
    PRIVATE: "#3F4658",
  },
} as const;

export type InvestmentClassColorKey = keyof typeof investmentClassPalette.light;
