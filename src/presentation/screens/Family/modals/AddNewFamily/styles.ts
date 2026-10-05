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
      buttonsContainer: {
        flexDirection: "row",
        justifyContent: "center",
      },
      container: {
        backgroundColor: theme.colors.surface,
        marginHorizontal: "5%",
        marginTop: "10%",
        padding: theme.sizes.spacing.xl,
      },
      inputContainer: {
        marginTop: theme.sizes.spacing.md,
      },
      titleContainer: {
        alignItems: "center",
      },
    }),
    theme,
  };
}

export default getStyles;
