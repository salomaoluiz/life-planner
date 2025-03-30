interface IConfigsModel {
  darkMode: boolean;
  language: string;
}

class ConfigsModel implements IConfigsModel {
  darkMode: boolean;
  language: string;

  constructor(params: IConfigsModel) {
    this.darkMode = params.darkMode;
    this.language = params.language;
  }

  static fromJSON(data: Record<string, unknown>): ConfigsModel {
    return new ConfigsModel({
      darkMode: data.dark_mode as boolean,
      language: data.language as string,
    });
  }

  toJSON() {
    return {
      dark_mode: this.darkMode,
      language: this.language,
    };
  }
}

export default ConfigsModel;
