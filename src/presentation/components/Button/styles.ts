import { StyleSheet } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

export type ButtonVariant = "destructive" | "ghost" | "primary" | "secondary";

function useStyles(
  variant: ButtonVariant,
  size: "lg" | "md",
  fullWidth: boolean,
  tone?: "expense",
  inline?: boolean,
  disabled?: boolean,
) {
  const { colors, radius, sizes, spacing } = useKitTheme();

  const paintedDisabled = variant === "primary" && !!disabled;
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
  const background = paintedDisabled
    ? colors.surfaceRaised
    : variants.background;
  const label = paintedDisabled ? colors.textSecondary : variants.label;

  return {
    iconColor: label,
    labelColor: label,
    styles: StyleSheet.create({
      root: {
        alignItems: "center",
        ...(fullWidth ? { alignSelf: "stretch" as const } : {}),
        ...(!fullWidth && variant === "ghost" && inline
          ? { alignSelf: "flex-start" as const }
          : {}),
        borderRadius: radius.md,
        flexDirection: "row",
        gap: spacing.xs,
        height: size === "lg" ? sizes.buttonHeight + 6 : sizes.buttonHeight,
        justifyContent: "center",
        paddingHorizontal: variant === "ghost" && inline ? 0 : spacing.md,
        ...(background ? { backgroundColor: background } : {}),
        ...(variants.border
          ? { borderColor: variants.border, borderWidth: 1 }
          : {}),
      },
    }),
  };
}

export default useStyles;
