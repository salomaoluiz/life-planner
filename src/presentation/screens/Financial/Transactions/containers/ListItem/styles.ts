import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      container: {
        flex: 1,
        padding: theme.sizes.spacing.medium,
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
      width10: {
        marginRight: "2%",
        width: "8%",
      },
      width25: {
        marginRight: "2%",
        width: "23%",
      },
    }),
    theme,
  };
}

export default getStyles;
