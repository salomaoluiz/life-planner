import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      day: { gap: theme.sizes.spacing.sm },
      group: { gap: theme.sizes.spacing.xs },
      list: { gap: theme.sizes.spacing.md },
      noticeHead: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.sm,
      },
      notices: {
        gap: theme.sizes.spacing.sm,
        paddingTop: theme.sizes.spacing.sm,
      },
      noticeText: { flex: 1, gap: theme.sizes.spacing.xxs },
      toolbar: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.sizes.spacing.sm,
      },
    }),
    theme,
  };
}

export default useStyles;
