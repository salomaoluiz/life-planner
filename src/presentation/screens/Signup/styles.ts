import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

const CARD_MAX_WIDTH = 420;

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      cardWrap: {
        alignSelf: "center",
        maxWidth: CARD_MAX_WIDTH,
        width: "100%",
      },
      container: {
        alignItems: "center",
        backgroundColor: theme.colors.background,
        flex: 1,
        gap: theme.sizes.spacing.lg,
        justifyContent: "center",
        padding: theme.sizes.spacing.lg,
      },
      form: { gap: theme.sizes.spacing.lg },
    }),
  };
}

export default useStyles;
