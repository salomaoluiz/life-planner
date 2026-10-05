import { StyleSheet } from "react-native";

import { useBreakpoint, useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();
  const isCompact = useBreakpoint() === "compact";

  return {
    styles: StyleSheet.create({
      fields: { gap: theme.sizes.spacing.md },
      moreRow: {
        flexDirection: isCompact ? "column" : "row",
        gap: theme.sizes.spacing.md,
      },
      pair: { flexDirection: "row", gap: theme.sizes.spacing.md },
      pairItem: { flex: 1 },
    }),
    theme,
  };
}

export default useStyles;
