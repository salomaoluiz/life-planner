import { VersionEntity } from "@domain/entities/version/VersionEntity";

export type VersionRepository = {
  getVersionInfo(params: { refresh: boolean }): Promise<VersionEntity>;
};
