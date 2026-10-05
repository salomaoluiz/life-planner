# Theme & styling (`src/presentation/theme`)

`const { theme, isDark, themeMode, setThemeMode } = useTheme()` from `@presentation/theme`. `themeMode` is `ThemeMode.SYSTEM | LIGHT | DARK` (default SYSTEM, follows the OS live); `isDark` is the resolved value. `theme = { breakpoints, colors, dark, fontsLoaded, sizes, typography }` (Paper MD3 theme extended). `useBreakpoint()` returns `compact | medium | expanded`; content width comes from `theme.sizes.size.contentMaxWidth`/`formMaxWidth`.

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
        padding: theme.sizes.spacing.md,
        paddingTop: isWeb() ? theme.sizes.spacing.xxxl : undefined,
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

## Sizes and typography (`theme.sizes`, `theme.typography`; NOT scaled per breakpoint)

- `spacing`: xxs 4 · xs 8 · sm 12 · md 16 · lg 20 · xl 24 · xxl 32 · xxxl 48
- `borderRadius`: sm 10 · md 14 · lg 20 · sheet 28 · full 999
- `size`: buttonHeight 48 · buttonHeightSheet 54 · inputHeight 50 · tabBarHeight 84 · touchTarget 44 · iconSm 16 · iconMd 20 · iconLg 24 · formMaxWidth 480 · contentMaxWidth 720
- `typography` (Manrope, system fallback until `fontsLoaded`): display 34 · title 22 · heading 16 · body 15 · bodyStrong 15 · input 16 · caption 13 · overline 12 · tab 11. Use `getFontStyle(weight, theme.fontsLoaded)` for a custom weight (never set `fontWeight` with a Manrope family) and `tabularNums` / `<Text tabular>` for money and quantities.
- `buildTheme(isDark, fontsLoaded)` builds the theme; `getScaleFunctions`/`rescaleSizes` remain for one-off scaling.
- Fonts load through `useAppFonts()` from `@infrastructure/fonts` (bundled Manrope 500-800; `{ failed, ready }`). `ThemeProvider` calls it, keeps the loader on until fonts are ready, and passes `fontsLoaded = ready && !failed` to `buildTheme`. Screens never call `useFonts`.

## Breakpoints (`theme.breakpoints`, `useBreakpoint()`)

`breakpoints = { compact: 0, medium: 768, expanded: 1024 }` (min widths, `constants/breakpoints.ts`). `useBreakpoint()` from `@presentation/theme` returns `"compact" | "medium" | "expanded"` (uses `useWindowDimensions`, so it reacts to resize/rotation). Globally mocked to `"compact"` in `tests/setup.tsx`; override with `(useBreakpoint as jest.Mock).mockReturnValue("expanded")`.

## Colors (`theme.colors`, light & dark in `constants/colors.ts`)

Grafite tokens (exactly these 18 in both themes, typed `Colors`/`ColorToken`):

| Token                           | Role                                         |
| ------------------------------- | -------------------------------------------- |
| `background`                    | screen background                            |
| `surface` / `surfaceRaised`     | cards, sheets / elevated or selected surface |
| `border`                        | 1 px outlines and dividers                   |
| `textPrimary` / `textSecondary` | main / supporting text                       |
| `accent` / `onAccent`           | primary action / content on accent           |
| `accentSoft` / `accentText`     | accent tint / accent-colored text            |
| `income` / `incomeSoft`         | positive amounts / tint                      |
| `expense` / `expenseSoft`       | negative amounts / tint                      |
| `warning` / `warningSoft`       | warnings / tint                              |
| `focusRing`                     | keyboard/input focus outline                 |
| `scrim`                         | modal overlay                                |

Paper MD3 keys (`primary`, `onSurface`, ...) are derived from the tokens by `buildPaperTheme` (`theme/paper`); never read them in components. Category picker colors live in `constants/categoryColors.ts`. No color literals outside `theme/constants` (guarded by `noColorLiterals.test.ts`). Adding a color: add it to BOTH `dark` and `light` in `constants/colors.ts` and keep `contrast.test.ts` (>= 4.5:1) green.

Flat surfaces: `surface` + 1 px `border`; no shadows except the quick-add button (spec 009); glass/blur is removed by spec 008.

Layout helpers: `@utils/device` (`getScreenSizes()`, `getWindowsSizes()`), `@utils/platform` (`isWeb()`, …).
