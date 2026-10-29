import { StyleSheet } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

function useStyles() {
  const { spacing } = useKitTheme();

  return {
    styles: StyleSheet.create({
      chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
      empty: { padding: spacing.sm },
      root: { gap: spacing.sm },
      searchWrap: { position: "relative", zIndex: 2 },
    }),
  };
}

export default useStyles;
