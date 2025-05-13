type AvailableLanguages = "en-US" | "pt-BR";

interface IConfigsModel {
  darkMode: boolean;
  language: string;
}
class ConfigsModel implements IConfigsModel {
  darkMode: boolean;
  language: AvailableLanguages;

  constructor(params: IConfigsModel) {
    this.darkMode = params.darkMode;
    this.language = params.language as AvailableLanguages;
  }

  static fromJSON(data: Record<string, unknown>): ConfigsModel {
    return new ConfigsModel({
      darkMode: data.dark_mode as boolean,
      language: data.language as AvailableLanguages,
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
