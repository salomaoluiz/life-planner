import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      form: { gap: theme.sizes.spacing.md },
      linkedRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.sm,
      },
      linkedSelect: { flex: 1 },
    }),
  };
}

export default useStyles;
