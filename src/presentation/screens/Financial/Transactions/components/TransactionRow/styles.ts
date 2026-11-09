import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

// Created once per theme spacing, not on every render of every row.
function useStyles() {
  const { spacing } = useKitTheme();
  const gap = spacing.xs;

  return {
    styles: useMemo(
      () =>
        StyleSheet.create({
          amountColumn: { alignItems: "flex-end", gap: 2 },
          muted: { opacity: 0.6 },
          pending: { opacity: 0.5 },
          trailing: { alignItems: "center", flexDirection: "row", gap },
        }),
      [gap],
    ),
  };
}

export default useStyles;
