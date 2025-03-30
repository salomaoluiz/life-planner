interface IConfigsEntity {
  darkMode: boolean;
  language: string;
}

class ConfigsEntity {
  darkMode: boolean;
  language: string;

  constructor(params: IConfigsEntity) {
    this.darkMode = params.darkMode;
    this.language = params.language;
  }

  static defaultConfigs(): ConfigsEntity {
    return new ConfigsEntity({
      darkMode: false,
      language: "en",
    });
  }
}

export default ConfigsEntity;
