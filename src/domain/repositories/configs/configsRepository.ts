import ConfigsEntity, {
  ThemeMode,
} from "@domain/entities/configs/ConfigsEntity";

export type ConfigsRepository = {
  getConfigs(): Promise<ConfigsEntity>;
  saveConfigs(params: SaveConfigsRepositoryParams): Promise<void>;
};

interface SaveConfigsRepositoryParams {
  language: string;
  themeMode: ThemeMode;
}

export { SaveConfigsRepositoryParams };
