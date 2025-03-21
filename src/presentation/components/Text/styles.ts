import { StyleSheet, TextStyle } from "react-native";

import { TextMode } from "@presentation/components/Text/types";
import { useTheme } from "@presentation/theme";
import { ThemeProp } from "@presentation/theme/types";

export interface CustomStyles {
  color?: string;
  noScale?: boolean;
  textAlign?: "center" | "left" | "right";
}

export function getStyles(customProps?: CustomStyles) {
  const { theme } = useTheme();

  const defaultStyles: TextStyle = {
    color: theme.colors.onSurface,
  };

  const { fontSizes, lineHeights } = getTextSizes(theme, customProps?.noScale);
  const customStyles = getCustomStyles(theme, customProps);

  return StyleSheet.create({
    [TextMode.Body]: {
      ...defaultStyles,
      ...customStyles,
      fontSize: fontSizes.small,
      lineHeight: lineHeights.small,
    },
    [TextMode.Caption]: {
      ...defaultStyles,
      ...customStyles,
      fontSize: fontSizes.xxsmall,
      lineHeight: lineHeights.xxsmall,
    },
    [TextMode.Display]: {
      ...defaultStyles,
      ...customStyles,
      fontSize: fontSizes.xxlarge,
      lineHeight: lineHeights.xxlarge,
    },
    [TextMode.Headline]: {
      ...defaultStyles,
      ...customStyles,
      fontSize: fontSizes.large,
      lineHeight: lineHeights.large,
    },
    [TextMode.Label]: {
      ...defaultStyles,
      ...customStyles,
      fontSize: fontSizes.xsmall,
      lineHeight: lineHeights.xsmall,
    },
    [TextMode.Title]: {
      ...defaultStyles,
      ...customStyles,
      fontSize: fontSizes.medium,
      lineHeight: lineHeights.medium,
    },
  });
}

function getCustomStyles(theme: ThemeProp, customStyles?: CustomStyles) {
  const styles = {
    color: customStyles?.color,
    textAlign: customStyles?.textAlign,
  };

  return Object.entries(styles).reduce<TextStyle>((acc, [key, value]) => {
    if (value) {
      acc = { ...acc, [key]: value };
    }
    return acc;
  }, {});
}

function getTextSizes(theme: ThemeProp, noScale?: boolean) {
  if (noScale) {
    return {
      fontSizes: theme.sizes.noScaled.fontSizes,
      lineHeights: theme.sizes.noScaled.lineHeights,
    };
  }

  return {
    fontSizes: theme.sizes.fontSizes,
    lineHeights: theme.sizes.lineHeights,
  };
}
