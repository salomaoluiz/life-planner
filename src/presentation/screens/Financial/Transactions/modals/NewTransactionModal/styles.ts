import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      backdrop: {
        backgroundColor: theme.colors.backdrop,
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
        marginTop: theme.sizes.spacing.large,
        padding: theme.sizes.spacing.small,
      },
      container: {
        backgroundColor: theme.colors.background,
        flex: 1,
        height: "100%",
        justifyContent: "center",
        margin: theme.sizes.spacing.large,
        padding: theme.sizes.spacing.large,
      },
      contentContainer: {},
      formContainer: {
        flex: 1,
      },
      fullLineContainer: {
        height: "30%",
      },
      helperTextContainer: {
        flex: 1,
      },
      lineContainer: {
        flexDirection: "row",
      },
      titleContainer: {
        alignItems: "center",
      },
    }),
    theme,
  };
}

export default getStyles;
