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
        flex: 1,
        padding: theme.sizes.spacing.medium,
        width: "100%",
      },

      iconsContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
      },
      row: {
        alignItems: "center",
        flexDirection: "row",
      },
      width5: {
        marginRight: "2%",
        width: "3%",
      },
      width20: {
        marginRight: "2%",
        width: "18%",
      },
      width25: {
        marginRight: "2%",
        width: "23%",
      },
    }),
    theme,
  };
}

export { getStyles, getWebStyles };
