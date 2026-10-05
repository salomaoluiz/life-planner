import { useKitTheme } from "./useKitTheme";

export type Tone = "accent" | "expense" | "income" | "neutral" | "warning";

type Colors = ReturnType<typeof useKitTheme>["colors"];

export function getToneColors(
  colors: Colors,
): Record<Tone, { background: string; foreground: string }> {
  return {
    accent: { background: colors.accentSoft, foreground: colors.accentText },
    expense: { background: colors.expenseSoft, foreground: colors.expense },
    income: { background: colors.incomeSoft, foreground: colors.income },
    neutral: {
      background: colors.surfaceRaised,
      foreground: colors.textSecondary,
    },
    warning: { background: colors.warningSoft, foreground: colors.warning },
  };
}
