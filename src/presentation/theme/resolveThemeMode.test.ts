import { ThemeMode } from "@domain/entities/configs/ConfigsEntity";

import { resolveIsDark } from "./resolveThemeMode";

it.each([
  [ThemeMode.SYSTEM, "dark", true],
  [ThemeMode.SYSTEM, "light", false],
  [ThemeMode.SYSTEM, null, false],
  [ThemeMode.SYSTEM, undefined, false],
  [ThemeMode.LIGHT, "dark", false],
  [ThemeMode.DARK, "light", true],
  [ThemeMode.DARK, null, true],
] as const)(
  "SHOULD resolve %s with OS %p to isDark=%s",
  (mode, scheme, expected) => {
    expect(resolveIsDark(mode, scheme)).toBe(expected);
  },
);
