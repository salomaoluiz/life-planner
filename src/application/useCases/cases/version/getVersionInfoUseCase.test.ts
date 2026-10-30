import { VersionUnavailable } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import getVersionInfoUseCase from "./getVersionInfoUseCase";

const getVersionInfo = jest.fn();
const useCase = getVersionInfoUseCase({
  versionRepository: { getVersionInfo },
} as unknown as Repositories);

beforeEach(() => jest.clearAllMocks());

it("SHOULD return what the repository returns", async () => {
  getVersionInfo.mockResolvedValue("info");

  expect(await useCase.execute({ refresh: false })).toBe("info");
  expect(getVersionInfo).toHaveBeenCalledWith({ refresh: false });
});

it("SHOULD add the use case to a domain error AND rethrow it", async () => {
  const error = new VersionUnavailable();
  getVersionInfo.mockRejectedValue(error);

  await expect(useCase.execute({ refresh: true })).rejects.toBe(error);
  expect(error.context).toMatchObject({
    useCase: "version.getVersionInfoUseCase",
  });
});

it("SHOULD rethrow an unknown error untouched", async () => {
  const error = new Error("x");
  getVersionInfo.mockRejectedValue(error);

  await expect(useCase.execute({ refresh: false })).rejects.toBe(error);
});

it("SHOULD expose the unique name", () => {
  expect(useCase.uniqueName).toBe("version.get_version_info_use_case");
});
