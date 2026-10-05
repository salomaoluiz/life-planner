import { availableLanguages } from "@presentation/i18n/translations";

export enum ThemeMode {
  DARK = "DARK",
  LIGHT = "LIGHT",
  SYSTEM = "SYSTEM",
}

interface IConfigsEntity {
  language: (typeof availableLanguages)[number];
  themeMode: ThemeMode;
}

class ConfigsEntity {
  language: (typeof availableLanguages)[number];
  themeMode: ThemeMode;

  constructor(params: IConfigsEntity) {
    this.language = params.language;
    this.themeMode = params.themeMode;
  }

  static defaultConfigs(): ConfigsEntity {
    return new ConfigsEntity({
      language: "en-US",
      themeMode: ThemeMode.SYSTEM,
    });
  }
}

export default ConfigsEntity;
