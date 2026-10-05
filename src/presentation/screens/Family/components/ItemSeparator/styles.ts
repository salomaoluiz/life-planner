import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      height: theme.sizes.spacing.sm,
    },
  });
}

export default getStyles;
