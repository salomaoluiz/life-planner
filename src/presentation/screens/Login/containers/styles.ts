import { useTheme } from "@presentation/theme";
import { StyleSheet } from "react-native";

function getStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.sizes.spacing.medium,
    },
    loginWithGoogleButtonContainer: {},
  });
}

export default getStyles;
