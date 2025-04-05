import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      container: {
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: theme.sizes.spacing.medium,
        paddingVertical: theme.sizes.spacing.xsmall,
      },
      deleteColumn: {
        marginRight: "2%",
        width: "8%",
      },
      detailsColumn: {
        marginRight: "2%",
        width: "48%",
      },
      iconColumn: {
        marginRight: "2%",
        width: "8%",
      },
      priceColumn: {
        marginRight: "2%",
        width: "23%",
      },
    }),
    theme,
  };
}

function getWebStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      container: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: theme.sizes.spacing.medium,
      },
      iconsContainer: {
        alignSelf: "center",
        position: "absolute",
        right: 0,
      },
      row: {
        alignItems: "center",
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
      },
      width25: {
        maxWidth: "25%",
      },
    }),
    theme,
  };
}

export { getStyles, getWebStyles };
