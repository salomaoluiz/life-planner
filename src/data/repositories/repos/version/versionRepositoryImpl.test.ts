import { Datasources } from "@data/datasource";

import versionRepositoryImpl from "./versionRepositoryImpl";

const datasource = { getVersionInfo: jest.fn().mockResolvedValue("info") };
const repository = versionRepositoryImpl({
  versionDatasource: datasource,
} as unknown as Datasources);

it("SHOULD forward the read to the datasource", async () => {
  expect(await repository.getVersionInfo({ refresh: true })).toBe("info");
  expect(datasource.getVersionInfo).toHaveBeenCalledWith({ refresh: true });
});
