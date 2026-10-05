import { TextStyle } from "react-native";

export type FontWeight = "500" | "600" | "700" | "800";

export interface TypographyStyle {
  fontFamily?: string;
  fontSize: number;
  fontVariant?: TextStyle["fontVariant"];
  fontWeight?: TextStyle["fontWeight"];
  letterSpacing?: number;
  lineHeight: number;
  textTransform?: "uppercase";
}

export type TypographyToken =
  | "body"
  | "bodyStrong"
  | "caption"
  | "display"
  | "heading"
  | "input"
  | "overline"
  | "tab"
  | "title";

const families: Record<FontWeight, string> = {
  "500": "Manrope_500Medium",
  "600": "Manrope_600SemiBold",
  "700": "Manrope_700Bold",
  "800": "Manrope_800ExtraBold",
};

export const tabularNums = {
  fontVariant: ["tabular-nums"] as TextStyle["fontVariant"],
};

export function getFontStyle(
  weight: FontWeight,
  fontsLoaded: boolean,
): Pick<TextStyle, "fontFamily" | "fontWeight"> {
  // Custom font files carry their own weight: never set fontWeight with them
  // (Android would synthesize bold on top of the bold file).
  return fontsLoaded
    ? { fontFamily: families[weight] }
    : { fontWeight: weight };
}

const scale: Record<
  TypographyToken,
  Omit<TypographyStyle, "fontFamily" | "fontWeight"> & { weight: FontWeight }
> = {
  body: { fontSize: 15, lineHeight: 22, weight: "500" },
  bodyStrong: { fontSize: 15, lineHeight: 22, weight: "600" },
  caption: { fontSize: 13, lineHeight: 18, weight: "500" },
  display: { fontSize: 34, letterSpacing: -0.5, lineHeight: 40, weight: "700" },
  heading: { fontSize: 16, lineHeight: 22, weight: "700" },
  input: { fontSize: 16, lineHeight: 22, weight: "500" },
  overline: {
    fontSize: 12,
    letterSpacing: 0.7,
    lineHeight: 16,
    textTransform: "uppercase",
    weight: "700",
  },
  tab: { fontSize: 11, lineHeight: 14, weight: "600" },
  title: { fontSize: 22, lineHeight: 28, weight: "700" },
};

export function getTypography(
  fontsLoaded: boolean,
): Record<TypographyToken, TypographyStyle> {
  const entries = (Object.keys(scale) as TypographyToken[]).map((token) => {
    const { weight, ...style } = scale[token];
    return [token, { ...style, ...getFontStyle(weight, fontsLoaded) }];
  });

  return Object.fromEntries(entries) as Record<
    TypographyToken,
    TypographyStyle
  >;
}
