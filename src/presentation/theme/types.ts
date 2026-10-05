import { Colors, Sizes, TypographyStyle, TypographyToken } from "./constants";

export type ThemeProp = {
  colors: Colors;
  dark: boolean;
  fontsLoaded: boolean;
  sizes: Sizes;
  typography: Record<TypographyToken, TypographyStyle>;
};
