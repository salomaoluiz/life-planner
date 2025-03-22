import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";
import { isWeb } from "@utils/platform";

function getStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.sizes.borderRadius.small,
      maxWidth: isWeb() ? "50%" : "100%",
      padding: theme.sizes.spacing.small,
    },
    containerLoading: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.sizes.borderRadius.small,
      maxWidth: isWeb() ? "50%" : "100%",
    },
    titleContainer: {
      alignItems: "center",
    },
  });
}

export default getStyles;
