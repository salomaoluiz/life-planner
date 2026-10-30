import { Datasources } from "@data/datasource";
import { VersionRepository } from "@domain/repositories/version";

// Never cached: the point is to see what is live right now.
function versionRepositoryImpl(datasources: Datasources): VersionRepository {
  return {
    async getVersionInfo(params) {
      return datasources.versionDatasource.getVersionInfo(params);
    },
  };
}

export default versionRepositoryImpl;
