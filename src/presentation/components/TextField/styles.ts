import { StyleSheet, ViewStyle } from "react-native";

import { KitTheme, useKitTheme } from "@components/utils/useKitTheme";

export function getFrameStyle(args: {
  disabled?: boolean;
  error?: boolean;
  focused?: boolean;
  theme: KitTheme;
}): ViewStyle {
  const { colors, radius, sizes } = args.theme;
  const activeBorder = args.focused ? colors.accent : colors.border;

  return {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: args.error ? colors.expense : activeBorder,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    height: sizes.inputHeight,
    opacity: args.disabled ? 0.5 : 1,
  };
}

function useStyles(multiline: boolean) {
  const theme = useKitTheme();
  const { colors, spacing, typography } = theme;
  function lines(n: number) {
    return typography.input.lineHeight * n + spacing.md;
  }

  return {
    multilineFrame: multiline
      ? {
          alignItems: "flex-start" as const,
          height: undefined,
          maxHeight: lines(6),
          minHeight: lines(3),
        }
      : {},
    styles: StyleSheet.create({
      icon: { paddingLeft: spacing.sm },
      input: {
        ...typography.input,
        color: colors.textPrimary,
        flex: 1,
        paddingHorizontal: spacing.sm,
        paddingVertical: multiline ? spacing.xs : 0,
      },
    }),
    theme,
  };
}

export default useStyles;
