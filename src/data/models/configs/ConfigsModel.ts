import { ThemeMode } from "@domain/entities/configs/ConfigsEntity";

type AvailableLanguages = "en-US" | "pt-BR";

interface IConfigsModel {
  language: string;
  themeMode: ThemeMode;
}

class ConfigsModel implements IConfigsModel {
  language: AvailableLanguages;
  themeMode: ThemeMode;

  constructor(params: IConfigsModel) {
    this.language = params.language as AvailableLanguages;
    this.themeMode = params.themeMode;
  }

  static fromJSON(data: Record<string, unknown>): ConfigsModel {
    return new ConfigsModel({
      language: data.language as AvailableLanguages,
      themeMode: toThemeMode(data),
    });
  }

  toJSON() {
    return {
      language: this.language,
      theme_mode: this.themeMode,
    };
  }
}

function toThemeMode(data: Record<string, unknown>): ThemeMode {
  const stored = data.theme_mode;

  if (Object.values(ThemeMode).includes(stored as ThemeMode)) {
    return stored as ThemeMode;
  }

  // Legacy configs (before spec 007) stored a boolean `dark_mode`.
  if (data.dark_mode === true) return ThemeMode.DARK;
  if (data.dark_mode === false) return ThemeMode.LIGHT;

  return ThemeMode.SYSTEM;
}

export default ConfigsModel;
