import VersionModel from "@data/models/version/VersionModel";
import { VersionDatasource } from "@data/repositories/repos/version/versionDatasource";
import { VersionUnavailable } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

export type Params = Parameters<VersionDatasource["getVersionInfo"]>[0];
export type Response = ReturnType<VersionDatasource["getVersionInfo"]>;

// Any failure means "the API did not answer": the app keeps working and says so.
async function getVersionInfo({ refresh }: Params): Response {
  try {
    const data = await api.get<Record<string, unknown>>(
      refresh ? "/v1/version?refresh=true" : "/v1/version",
    );

    return VersionModel.fromJSON(data);
  } catch (error) {
    const unavailable = new VersionUnavailable();
    unavailable.addContext({
      datasource: "VersionDatasource - getVersionInfo",
      error,
    });
    throw unavailable;
  }
}

export default getVersionInfo;
