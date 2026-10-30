import { VersionUnavailable } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import versionDatasource from "./datasource";

jest.mock("@infrastructure/api", () => ({ api: { get: jest.fn() } }));

const datasource = versionDatasource();

beforeEach(() => jest.clearAllMocks());

it("SHOULD call the plain endpoint AND map the body", async () => {
  jest.mocked(api.get).mockResolvedValue({
    api: { current: "1.0.0" },
    environment: "PRODUCTION",
  });

  const result = await datasource.getVersionInfo({ refresh: false });

  expect(api.get).toHaveBeenCalledWith("/v1/version");
  expect(result.api.current).toBe("1.0.0");
  expect(result.environment).toBe("PRODUCTION");
});

it("SHOULD ask for a refresh WHEN requested", async () => {
  jest.mocked(api.get).mockResolvedValue({});

  await datasource.getVersionInfo({ refresh: true });

  expect(api.get).toHaveBeenCalledWith("/v1/version?refresh=true");
});

it("SHOULD throw VersionUnavailable WHEN the request fails", async () => {
  jest.mocked(api.get).mockRejectedValue(new Error("offline"));

  await expect(
    datasource.getVersionInfo({ refresh: false }),
  ).rejects.toBeInstanceOf(VersionUnavailable);
});
