export type Colors = Record<ColorToken, string>;

export type ColorToken =
  | "accent"
  | "accentSoft"
  | "accentText"
  | "background"
  | "border"
  | "expense"
  | "expenseSoft"
  | "focusRing"
  | "income"
  | "incomeSoft"
  | "onAccent"
  | "scrim"
  | "surface"
  | "surfaceRaised"
  | "textPrimary"
  | "textSecondary"
  | "warning"
  | "warningSoft";

const dark: Colors = {
  accent: "#7C8CFF",
  accentSoft: "rgba(124,140,255,0.16)",
  accentText: "#AEB8FF",
  background: "#0E1116",
  border: "#2A303B",
  expense: "#FF8080",
  expenseSoft: "rgba(255,128,128,0.14)",
  focusRing: "rgba(124,140,255,0.35)",
  income: "#3DD68C",
  incomeSoft: "rgba(61,214,140,0.14)",
  onAccent: "#0E1116",
  scrim: "rgba(5,7,10,0.72)",
  surface: "#161A21",
  surfaceRaised: "#1E232C",
  textPrimary: "#E8EAF0",
  textSecondary: "#9AA3B2",
  warning: "#F5B94A",
  warningSoft: "rgba(245,185,74,0.14)",
};

const light: Colors = {
  accent: "#4F5BD5",
  accentSoft: "#E8EAFC",
  accentText: "#3F4AC0",
  background: "#F5F6F8",
  border: "#DDE1E8",
  expense: "#B83229",
  expenseSoft: "#FCE8E6",
  focusRing: "rgba(79,91,213,0.25)",
  income: "#17734A",
  incomeSoft: "#E2F4EA",
  onAccent: "#FFFFFF",
  scrim: "rgba(21,25,34,0.45)",
  surface: "#FFFFFF",
  surfaceRaised: "#EEF0F4",
  textPrimary: "#151922",
  textSecondary: "#5A6273",
  warning: "#8F5A00",
  warningSoft: "#FDF0D8",
};

const colors = { dark, light };

export default colors;
