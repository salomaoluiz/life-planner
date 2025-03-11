import { StyleSheet } from "react-native";
import { useTheme } from "@presentation/theme";
import { getScaleRatio } from "@presentation/theme/constants/utils/sizes";
import { useMemo } from "react";

const useStyles = () => {
  const { theme } = useTheme();
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          paddingHorizontal: theme.sizes.spacing.medium,
          backgroundColor: theme.colors.background,
        },
        image: {
          height: 300 * getScaleRatio().scaleFactor,
          width: 300 * getScaleRatio().scaleFactor,
        },
        titleContainer: {
          marginBottom: theme.sizes.spacing.medium,
        },
        title: {
          textAlign: "center",
          color: theme.colors.onBackground,
        },
        descriptionContainer: {
          marginBottom: theme.sizes.spacing.medium,
        },
        description: {
          textAlign: "center",
          color: theme.colors.onBackground,
        },
        buttonContainer: {
          marginBottom: theme.sizes.spacing.medium,
        },
      }),
    [],
  );
};

export default useStyles;
