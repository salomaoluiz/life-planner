import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      buttonsContainer: {
        justifyContent: "center",
        width: "100%",
      },
      container: { flex: 1 },
    }),
    theme,
  };
}

export default getStyles;
