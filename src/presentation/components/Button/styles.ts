import { StyleSheet } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

export type ButtonVariant = "destructive" | "ghost" | "primary" | "secondary";

function useStyles(
  variant: ButtonVariant,
  size: "lg" | "md",
  fullWidth: boolean,
  tone?: "expense",
) {
  const { colors, radius, sizes, spacing } = useKitTheme();

  const variants = {
    destructive: {
      background: colors.expenseSoft,
      border: undefined,
      label: colors.expense,
    },
    ghost: {
      background: undefined,
      border: undefined,
      label: tone === "expense" ? colors.expense : colors.accentText,
    },
    primary: {
      background: colors.accent,
      border: undefined,
      label: colors.onAccent,
    },
    secondary: {
      background: colors.surfaceRaised,
      border: colors.border,
      label: colors.textPrimary,
    },
  }[variant];

  return {
    iconColor: variants.label,
    labelColor: variants.label,
    styles: StyleSheet.create({
      root: {
        alignItems: "center",
        alignSelf: fullWidth ? "stretch" : "flex-start",
        borderRadius: radius.md,
        flexDirection: "row",
        gap: spacing.xs,
        height: size === "lg" ? sizes.buttonHeight + 6 : sizes.buttonHeight,
        justifyContent: "center",
        paddingHorizontal: spacing.md,
        ...(variants.background
          ? { backgroundColor: variants.background }
          : {}),
        ...(variants.border
          ? { borderColor: variants.border, borderWidth: 1 }
          : {}),
      },
    }),
  };
}

export default useStyles;
