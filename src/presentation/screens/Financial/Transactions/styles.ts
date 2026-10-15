import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      monthSwitcher: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      },
      root: { flex: 1 },
      toolbar: {
        gap: theme.sizes.spacing.lg,
        paddingBottom: theme.sizes.spacing.lg,
      },
    }),
  };
}

export default useStyles;
