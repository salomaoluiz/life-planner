import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

export const FAB_SIZE = 56;
export const FAB_RADIUS = 16; // fixed by the spec 050 design

function useStyles(extended: boolean) {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      button: {
        alignItems: "center",
        backgroundColor: theme.colors.accent,
        borderRadius: FAB_RADIUS,
        elevation: 8,
        flexDirection: "row",
        gap: theme.sizes.spacing.sm,
        height: FAB_SIZE,
        justifyContent: "center",
        shadowColor: theme.colors.accent,
        shadowOffset: { height: 6, width: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        ...(extended
          ? { paddingHorizontal: theme.sizes.spacing.lg }
          : { width: FAB_SIZE }),
      },
    }),
    theme,
  };
}

export default useStyles;
