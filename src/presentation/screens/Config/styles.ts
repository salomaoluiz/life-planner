import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      fields: { gap: theme.sizes.spacing.lg },
      logout: { alignItems: "flex-start" },
    }),
  };
}

export default useStyles;
