import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    blurView: {
      flex: 1,
      width: "100%",
    },
    buttonBase: {
      borderRadius: 0,
      flex: 1,
    },
    buttonContent: {
      height: theme.sizes.spacing.xxlarge,
    },
    buttonWrapper: {
      borderRadius: theme.sizes.borderRadius.large,
      flex: 1,
      overflow: "hidden",
    },
    disabled: {
      opacity: 0.5,
    },
  });
}

export default getStyles;
