import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

const SIZE = 52;
export const RADIUS = 16; // md (14) + 2, fixed by the spec

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      button: {
        alignItems: "center",
        backgroundColor: theme.colors.accent,
        borderRadius: RADIUS,
        elevation: 8,
        height: SIZE,
        justifyContent: "center",
        shadowColor: theme.colors.accent,
        shadowOffset: { height: 6, width: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        width: SIZE,
      },
    }),
    theme,
  };
}

export default useStyles;
