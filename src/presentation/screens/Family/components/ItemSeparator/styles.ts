import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      height: theme.sizes.spacing.small,
    },
  });
}

export default getStyles;
