import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      backdrop: {
        backgroundColor: theme.colors.scrim,
        height: "100%",
        position: "absolute",
        width: "100%",
      },
      button: {
        flexDirection: "row",
        justifyContent: "center",
        width: "100%",
      },
      buttonContainer: {
        marginTop: theme.sizes.spacing.xl,
        padding: theme.sizes.spacing.sm,
      },
      container: {
        backgroundColor: theme.colors.background,
        flex: 1,
        height: "100%",
        justifyContent: "center",
        margin: theme.sizes.spacing.xl,
        padding: theme.sizes.spacing.xl,
      },
      iconBox: {
        borderRadius: 8,
        margin: 4,
        padding: 2,
      },
      iconGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
      },
      loadingContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
      },
      titleContainer: {
        alignItems: "center",
      },
    }),
    theme,
  };
}

export default getStyles;
