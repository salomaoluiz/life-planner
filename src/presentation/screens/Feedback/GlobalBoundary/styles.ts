import { StyleSheet } from "react-native";

import { getScaleRatio } from "@presentation/theme/constants/utils/sizes";
import { lightTheme } from "@presentation/theme/provider";

const styles = StyleSheet.create({
  buttonContainer: {
    marginBottom: lightTheme.sizes.spacing.md,
  },
  container: {
    alignItems: "center",
    backgroundColor: lightTheme.colors.background,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: lightTheme.sizes.spacing.md,
  },
  description: {
    color: lightTheme.colors.textPrimary,
    fontSize: lightTheme.typography.heading.fontSize,
    lineHeight: lightTheme.typography.heading.lineHeight,
    textAlign: "center",
  },
  descriptionContainer: {
    marginBottom: lightTheme.sizes.spacing.md,
  },
  image: {
    height: 300 * getScaleRatio().scaleFactor,
    width: 300 * getScaleRatio().scaleFactor,
  },
  title: {
    color: lightTheme.colors.textPrimary,
    fontSize: lightTheme.typography.title.fontSize,
    lineHeight: lightTheme.typography.title.lineHeight,
    textAlign: "center",
  },
  titleContainer: {
    marginBottom: lightTheme.sizes.spacing.md,
  },
});

export default styles;
