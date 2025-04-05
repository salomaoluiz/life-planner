import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    category: {
      width: "25%",
    },
    container: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      padding: theme.sizes.spacing.medium,
      width: "100%",
    },
    date: {
      width: "25%",
    },
    description: {
      width: "25%",
    },
    row: {
      alignItems: "center",
      borderRightWidth: 1,
      flexDirection: "row",
      justifyContent: "center",
    },
    value: {
      borderRightWidth: 0,
      width: "25%",
    },
  });
}

export default getStyles;
