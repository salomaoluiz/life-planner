import ConfigsEntity from "@domain/entities/configs/ConfigsEntity";

export interface IConfigsDTO {
  darkMode: boolean;
  language: string;
}

class ConfigsDTO {
  darkMode: boolean;
  language: string;

  constructor(params: IConfigsDTO) {
    this.darkMode = params.darkMode;
    this.language = params.language;
  }

  static fromEntity(entity: ConfigsEntity) {
    return new ConfigsDTO({
      darkMode: entity.darkMode,
      language: entity.language,
    });
  }
}

export default ConfigsDTO;
