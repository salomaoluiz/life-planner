import { StyleSheet } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

function useStyles() {
  const { spacing } = useKitTheme();

  return {
    styles: StyleSheet.create({
      count: { alignItems: "baseline", flexDirection: "row", gap: spacing.xs },
      date: { flex: 1, minWidth: 140 },
      dates: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
      section: { gap: spacing.xs },
      sourcesList: { gap: spacing.xxs },
    }),
  };
}

export default useStyles;
