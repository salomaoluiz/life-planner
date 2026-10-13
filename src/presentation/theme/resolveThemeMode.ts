import { ColorSchemeName } from "react-native";

import { ThemeMode } from "@domain/entities/configs/ConfigsEntity";

export function resolveIsDark(
  themeMode: ThemeMode,
  systemScheme: ColorSchemeName | undefined,
): boolean {
  if (themeMode === ThemeMode.DARK) return true;
  if (themeMode === ThemeMode.LIGHT) return false;

  return systemScheme === "dark";
}
