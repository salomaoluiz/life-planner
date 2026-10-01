# Theme & styling (`src/presentation/theme`)

`const { theme, isDark, setIsDark } = useTheme()` from `@presentation/theme`. `theme = { colors, sizes, dark }` (Paper MD3 theme extended).

## Styles pattern (every screen/component has `styles.ts`)

```ts
import { StyleSheet } from "react-native";
import { useTheme } from "@presentation/theme";
import { isWeb } from "@utils/platform";

function useStyles() {
  const { theme } = useTheme();
  return {
    styles: StyleSheet.create({
      container: {
        backgroundColor: theme.colors.background,
        flex: 1,
        padding: theme.sizes.spacing.medium,
        paddingTop: isWeb() ? theme.sizes.spacing.xxlarge : undefined,
      },
    }),
    theme,
  };
}
export default useStyles;
```

It is a hook (it calls `useTheme()`), so it is named `useStyles` and follows the rules of hooks: call it at the top of the component, unconditionally: `const { styles, theme } = useStyles();`. Always use a default export. Style keys are alphabetical. Never hard-code colors or sizes.

If styles depend on state, pass it as a parameter: `useStyles({ disabled, isFocused })`.

> **Legacy:** about 80 existing `styles.ts` files still export `getStyles` (default or named). When you touch one, rename it to `useStyles` (default export) and update its callers.

## Sizes (`theme.sizes`, auto-scaled per device)

- `spacing`: xxsmall 4 · xsmall 8 · small 12 · medium 16 · large 24 · xlarge 32 · xxlarge 48 · xxxlarge 64
- `fontSizes`: xxsmall 10 · xsmall 12 · small 14 · medium 16 · large 24 · xlarge 32 · xxlarge 48
- `lineHeights`: same keys
- `borderRadius`: small 4 · medium 8 · large 16 · xlarge 32 · full "50%"
- Icon sizes typically `theme.sizes.spacing.large`.

## Colors (`theme.colors`, light & dark in `constants/colors.ts`)

MD3 keys: `primary, onPrimary, primaryContainer, onPrimaryContainer, secondary*, tertiary*, error, onError, errorContainer, background, onBackground, surface, onSurface, surfaceVariant, onSurfaceVariant, outline, outlineVariant, inverse*, shadow, scrim, backdrop, surfaceDisabled, onSurfaceDisabled, elevation.level0-5`.
App-specific: `financial.expense`, `financial.income`, `glassBackground(Focused)`, `glassBorder(Focused)`, `glassButtonPrimaryBg/Border`, `glassButtonSecondaryBg/Border`, `glassTextPlaceholder`, `glassTextSecondary`.
Adding a color: add to BOTH light and dark objects.

Glass surfaces: `<BlurView intensity={theme.dark ? 20 : 40} tint={theme.dark ? "dark" : "light"} />` inside a wrapper with `overflow: "hidden"`, `borderRadius`, `borderColor: theme.colors.glassBorder`.

Layout helpers: `@utils/device` (`getScreenSizes()`, `getWindowsSizes()`), `@utils/platform` (`isWeb()`, …).
