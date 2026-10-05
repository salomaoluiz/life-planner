import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";
import { getScaleRatio } from "@presentation/theme/constants/utils/sizes";

function useStyles() {
  const { theme } = useTheme();
  const memoizedStyle = useMemo(
    () =>
      StyleSheet.create({
        buttonContainer: {
          flexDirection: "row",
          marginBottom: theme.sizes.spacing.md,
        },
        container: {
          alignItems: "center",
          backgroundColor: theme.colors.background,
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: theme.sizes.spacing.md,
        },

        descriptionContainer: {
          marginBottom: theme.sizes.spacing.md,
        },
        image: {
          height: 300 * getScaleRatio().scaleFactor,
          width: 300 * getScaleRatio().scaleFactor,
        },

        titleContainer: {
          marginBottom: theme.sizes.spacing.md,
        },
      }),
    [],
  );

  return {
    styles: memoizedStyle,
    theme,
  };
}

export default useStyles;
