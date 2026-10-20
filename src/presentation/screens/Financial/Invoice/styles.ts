import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles(columns: 1 | 2 = 1) {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      // Wide: one wrapping row; row-reverse puts the first action (Pay) last
      // visually while the Tab order stays the compact one.
      actions:
        columns === 2
          ? {
              flexDirection: "row-reverse",
              flexWrap: "wrap",
              gap: theme.sizes.spacing.sm,
            }
          : { gap: theme.sizes.spacing.sm },
      body: { gap: theme.sizes.spacing.lg },
      header: { gap: theme.sizes.spacing.xs },
      headerRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      },
      trailing: {
        alignItems: "flex-end",
        gap: theme.sizes.spacing.xxs,
      },
    }),
  };
}

export default useStyles;
