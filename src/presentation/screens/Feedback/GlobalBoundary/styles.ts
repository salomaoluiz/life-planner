import { StyleSheet } from "react-native";

import { getScaleRatio } from "@presentation/theme/constants/utils/sizes";
import { lightTheme } from "@presentation/theme/provider";

const styles = StyleSheet.create({
  buttonContainer: {
    marginBottom: lightTheme.sizes.spacing.medium,
  },
  container: {
    alignItems: "center",
    backgroundColor: lightTheme.colors.background,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: lightTheme.sizes.spacing.medium,
  },
  description: {
    color: lightTheme.colors.onBackground,
    fontSize: lightTheme.sizes.fontSizes.medium,
    lineHeight: lightTheme.sizes.lineHeights.medium,
    textAlign: "center",
  },
  descriptionContainer: {
    marginBottom: lightTheme.sizes.spacing.medium,
  },
  image: {
    height: 300 * getScaleRatio().scaleFactor,
    width: 300 * getScaleRatio().scaleFactor,
  },
  title: {
    color: lightTheme.colors.onBackground,
    fontSize: lightTheme.sizes.fontSizes.large,
    lineHeight: lightTheme.sizes.lineHeights.large,
    textAlign: "center",
  },
  titleContainer: {
    marginBottom: lightTheme.sizes.spacing.medium,
  },
});

export default styles;
