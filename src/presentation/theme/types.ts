import {
  breakpoints,
  Colors,
  Sizes,
  TypographyStyle,
  TypographyToken,
} from "./constants";

export type ThemeProp = {
  breakpoints: typeof breakpoints;
  colors: Colors;
  dark: boolean;
  fontsLoaded: boolean;
  sizes: Sizes;
  typography: Record<TypographyToken, TypographyStyle>;
};
