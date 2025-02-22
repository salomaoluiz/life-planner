import colors from "./colors";

it("SHOULD return the light theme colors", () => {
  expect(colors.light).toEqual({
    backdrop: "rgba(45, 49, 56, 0.4)",
    background: "rgb(253, 252, 255)",
    elevation: {
      level0: "transparent",
      level1: "rgb(240, 244, 251)",
      level2: "rgb(233, 239, 249)",
      level3: "rgb(225, 235, 246)",
      level4: "rgb(223, 233, 245)",
      level5: "rgb(218, 230, 244)",
    },
    error: "rgb(186, 26, 26)",
    errorContainer: "rgb(255, 218, 214)",
    inverseOnSurface: "rgb(241, 240, 244)",
    inversePrimary: "rgb(165, 200, 255)",
    inverseSurface: "rgb(47, 48, 51)",
    onBackground: "rgb(26, 28, 30)",
    onError: "rgb(255, 255, 255)",
    onErrorContainer: "rgb(65, 0, 2)",
    onPrimary: "rgb(255, 255, 255)",
    onPrimaryContainer: "rgb(0, 28, 58)",
    onSecondary: "rgb(255, 255, 255)",
    onSecondaryContainer: "rgb(43, 23, 0)",
    onSurface: "rgb(26, 28, 30)",
    onSurfaceDisabled: "rgba(26, 28, 30, 0.38)",
    onSurfaceVariant: "rgb(67, 71, 78)",
    onTertiary: "rgb(255, 255, 255)",
    onTertiaryContainer: "rgb(13, 32, 0)",
    outline: "rgb(116, 119, 127)",
    outlineVariant: "rgb(195, 198, 207)",
    primary: "rgb(0, 95, 175)",
    primaryContainer: "rgb(212, 227, 255)",
    scrim: "rgb(0, 0, 0)",
    secondary: "rgb(135, 82, 0)",
    secondaryContainer: "rgb(255, 221, 186)",
    shadow: "rgb(0, 0, 0)",
    surface: "rgb(253, 252, 255)",
    surfaceDisabled: "rgba(26, 28, 30, 0.12)",
    surfaceVariant: "rgb(224, 226, 236)",
    tertiary: "rgb(56, 107, 1)",
    tertiaryContainer: "rgb(183, 244, 129)",
  });
});

it("SHOULD return the dark theme colors", () => {
  expect(colors.dark).toEqual({
    backdrop: "rgba(45, 49, 56, 0.4)",
    background: "rgb(26, 28, 30)",
    elevation: {
      level0: "transparent",
      level1: "rgb(33, 37, 41)",
      level2: "rgb(37, 42, 48)",
      level3: "rgb(41, 47, 55)",
      level4: "rgb(43, 49, 57)",
      level5: "rgb(46, 52, 62)",
    },
    error: "rgb(255, 180, 171)",
    errorContainer: "rgb(147, 0, 10)",
    inverseOnSurface: "rgb(47, 48, 51)",
    inversePrimary: "rgb(0, 95, 175)",
    inverseSurface: "rgb(227, 226, 230)",
    onBackground: "rgb(227, 226, 230)",
    onError: "rgb(105, 0, 5)",
    onErrorContainer: "rgb(255, 180, 171)",
    onPrimary: "rgb(0, 49, 95)",
    onPrimaryContainer: "rgb(212, 227, 255)",
    onSecondary: "rgb(72, 42, 0)",
    onSecondaryContainer: "rgb(255, 221, 186)",
    onSurface: "rgb(227, 226, 230)",
    onSurfaceDisabled: "rgba(227, 226, 230, 0.38)",
    onSurfaceVariant: "rgb(195, 198, 207)",
    onTertiary: "rgb(26, 55, 0)",
    onTertiaryContainer: "rgb(183, 244, 129)",
    outline: "rgb(141, 145, 153)",
    outlineVariant: "rgb(67, 71, 78)",
    primary: "rgb(165, 200, 255)",
    primaryContainer: "rgb(0, 71, 134)",
    scrim: "rgb(0, 0, 0)",
    secondary: "rgb(255, 184, 101)",
    secondaryContainer: "rgb(102, 61, 0)",
    shadow: "rgb(0, 0, 0)",
    surface: "rgb(26, 28, 30)",
    surfaceDisabled: "rgba(227, 226, 230, 0.12)",
    surfaceVariant: "rgb(67, 71, 78)",
    tertiary: "rgb(156, 215, 105)",
    tertiaryContainer: "rgb(40, 80, 0)",
  });
});
