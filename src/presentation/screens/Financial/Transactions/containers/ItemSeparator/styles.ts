import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      borderBottomWidth: 1,
      borderColor: theme.colors.outline,
    },
  });
}

export default getStyles;
