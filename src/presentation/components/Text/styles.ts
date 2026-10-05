import { StyleSheet, TextStyle } from "react-native";

import { useTheme } from "@presentation/theme";
import { getFontStyle, tabularNums } from "@presentation/theme/constants";

import { TextMode, TextProps } from "./types";

export function getStyles(textProps: TextProps) {
  const { theme } = useTheme();
  const { typography } = theme;

  const base: TextStyle = { color: theme.colors.textPrimary };
  const custom = getCustomStyles(textProps, theme.fontsLoaded);

  function variant(style: TextStyle, color?: string): TextStyle {
    return { ...base, ...style, ...(color ? { color } : {}), ...custom };
  }

  return StyleSheet.create({
    [TextMode.Body]: variant(typography.body),
    [TextMode.Caption]: variant(
      typography.caption,
      textProps?.color ?? theme.colors.textSecondary,
    ),
    [TextMode.Display]: variant(typography.display),
    [TextMode.Headline]: variant(typography.title),
    [TextMode.Label]: variant(
      typography.caption,
      textProps?.color ?? theme.colors.textSecondary,
    ),
    [TextMode.Title]: variant(typography.heading),
  });
}

function getCustomStyles(
  textProps: TextProps,
  fontsLoaded: boolean,
): TextStyle {
  return {
    ...(textProps?.color ? { color: textProps.color } : {}),
    ...(textProps?.bold ? getFontStyle("700", fontsLoaded) : {}),
    ...(textProps?.tabular ? tabularNums : {}),
    ...(textProps?.textAlign ? { textAlign: textProps.textAlign } : {}),
  };
}
