import { VersionEntity } from "@domain/entities/version/VersionEntity";

export interface VersionDatasource {
  getVersionInfo(params: { refresh: boolean }): Promise<VersionEntity>;
}
