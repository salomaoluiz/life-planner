import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();
  const { spacing } = theme.sizes;

  return {
    styles: StyleSheet.create({
      footer: { flexDirection: "row", gap: spacing.sm },
      footerButton: { flex: 1 },
      form: { gap: spacing.md },
      itemHead: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      },
    }),
  };
}

export default useStyles;
