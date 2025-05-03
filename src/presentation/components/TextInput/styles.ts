import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();
  return StyleSheet.create({
    textInput: {
      minHeight: theme.sizes.spacing.xxlarge,
      width: "100%",
    },
  });
}

export default getStyles;
