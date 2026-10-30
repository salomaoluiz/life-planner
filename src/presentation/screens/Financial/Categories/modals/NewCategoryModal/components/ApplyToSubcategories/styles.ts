import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

const ARCHIVED_OPACITY = 0.55;

function useStyles() {
  const { theme } = useTheme();
  const { spacing } = theme.sizes;

  return {
    indent: (depth: number) => ({ paddingLeft: depth * spacing.lg }),
    styles: StyleSheet.create({
      archived: { opacity: ARCHIVED_OPACITY },
      chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
      name: { flex: 1 },
      previewRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: spacing.sm,
        minHeight: spacing.xl,
      },
      root: { gap: spacing.sm },
      section: { gap: spacing.xs },
    }),
  };
}

export default useStyles;
