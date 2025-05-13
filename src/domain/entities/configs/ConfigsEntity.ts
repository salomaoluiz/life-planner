import { availableLanguages } from "@presentation/i18n/translations";

interface IConfigsEntity {
  darkMode: boolean;
  language: (typeof availableLanguages)[number];
}

class ConfigsEntity {
  darkMode: boolean;
  language: (typeof availableLanguages)[number];

  constructor(params: IConfigsEntity) {
    this.darkMode = params.darkMode;
    this.language = params.language;
  }

  static defaultConfigs(): ConfigsEntity {
    return new ConfigsEntity({
      darkMode: false,
      language: "en-US",
    });
  }
}

export default ConfigsEntity;
