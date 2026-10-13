import { TextStyle } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

import { TextMode, TextProps, TextTone } from "./types";

export function useTextStyle(mode: TextMode, props: TextProps): TextStyle {
  const { colors, typography } = useKitTheme();

  const toneColors: Record<TextTone, string> = {
    accent: colors.accentText,
    expense: colors.expense,
    income: colors.income,
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    warning: colors.warning,
  };
  const defaultTone: TextTone =
    mode === TextMode.Caption ? "secondary" : "primary";

  return {
    ...typography[mode],
    color: props.color ?? toneColors[props.tone ?? defaultTone],
    ...(props.bold ? { fontWeight: "bold" } : {}),
    ...(props.tabular ? { fontVariant: ["tabular-nums"] } : {}),
    ...(mode === TextMode.Overline ? { textTransform: "uppercase" } : {}),
    textAlign: props.align ?? props.textAlign,
  };
}
