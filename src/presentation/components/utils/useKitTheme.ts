import { useBreakpoint, useTheme } from "@presentation/theme";

export type KitTheme = ReturnType<typeof useKitTheme>;

export function useKitTheme() {
  const { isDark, theme } = useTheme();
  const breakpoint = useBreakpoint();

  return {
    breakpoint,
    colors: theme.colors,
    isDark,
    radius: theme.sizes.borderRadius,
    sizes: theme.sizes.size,
    spacing: theme.sizes.spacing,
    typography: theme.typography,
  };
}
