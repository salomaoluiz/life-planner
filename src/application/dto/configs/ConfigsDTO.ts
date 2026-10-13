import ConfigsEntity, {
  ThemeMode,
} from "@domain/entities/configs/ConfigsEntity";

export interface IConfigsDTO {
  language: string;
  themeMode: ThemeMode;
}

class ConfigsDTO {
  language: string;
  themeMode: ThemeMode;

  constructor(params: IConfigsDTO) {
    this.language = params.language;
    this.themeMode = params.themeMode;
  }

  static fromEntity(entity: ConfigsEntity) {
    return new ConfigsDTO({
      language: entity.language,
      themeMode: entity.themeMode,
    });
  }
}

export default ConfigsDTO;
