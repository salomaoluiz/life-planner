import { StyleSheet } from "react-native";
import { getScaleRatio } from "@presentation/theme/constants/utils/sizes";
import { lightTheme } from "@presentation/theme/provider";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: lightTheme.sizes.spacing.medium,
    backgroundColor: lightTheme.colors.background,
  },
  image: {
    height: 300 * getScaleRatio().scaleFactor,
    width: 300 * getScaleRatio().scaleFactor,
  },
  titleContainer: {
    marginBottom: lightTheme.sizes.spacing.medium,
  },
  title: {
    textAlign: "center",
    color: lightTheme.colors.onBackground,
    fontSize: lightTheme.sizes.fontSizes.large,
    lineHeight: lightTheme.sizes.lineHeights.large,
  },
  descriptionContainer: {
    marginBottom: lightTheme.sizes.spacing.medium,
  },
  description: {
    textAlign: "center",
    color: lightTheme.colors.onBackground,
    fontSize: lightTheme.sizes.fontSizes.medium,
    lineHeight: lightTheme.sizes.lineHeights.medium,
  },
  buttonContainer: {
    marginBottom: lightTheme.sizes.spacing.medium,
  },
});

export default styles;
