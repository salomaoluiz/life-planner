import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";
import { getScaleRatio } from "@presentation/theme/constants/utils/sizes";

function useStyles() {
  const { theme } = useTheme();
  return useMemo(
    () =>
      StyleSheet.create({
        buttonContainer: {
          marginBottom: theme.sizes.spacing.medium,
        },
        container: {
          alignItems: "center",
          backgroundColor: theme.colors.background,
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: theme.sizes.spacing.medium,
        },
        description: {
          color: theme.colors.onBackground,
          textAlign: "center",
        },
        descriptionContainer: {
          marginBottom: theme.sizes.spacing.medium,
        },
        image: {
          height: 300 * getScaleRatio().scaleFactor,
          width: 300 * getScaleRatio().scaleFactor,
        },
        title: {
          color: theme.colors.onBackground,
          textAlign: "center",
        },
        titleContainer: {
          marginBottom: theme.sizes.spacing.medium,
        },
      }),
    [],
  );
}

export default useStyles;
