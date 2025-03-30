import ConfigsEntity from "@domain/entities/configs/ConfigsEntity";

export type ConfigsRepository = {
  getConfigs(): Promise<ConfigsEntity>;
  saveConfigs(params: SaveConfigsRepositoryParams): Promise<void>;
};

interface SaveConfigsRepositoryParams {
  darkMode: boolean;
  language: string;
}

export { SaveConfigsRepositoryParams };
