import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: { flex: 1, marginTop: theme.sizes.spacing.xxsmall },
  });
}

export default getStyles;
