import { GenericError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import getWebPushKeyUseCase from "./getWebPushKeyUseCase";

const getWebPushKey = jest.fn();
const useCase = getWebPushKeyUseCase({
  notificationRepository: { getWebPushKey },
} as unknown as Repositories);

beforeEach(() => jest.clearAllMocks());

it("SHOULD return what the repository returns", async () => {
  getWebPushKey.mockResolvedValue("result");

  expect(await useCase.execute()).toBe("result");
  expect(getWebPushKey).toHaveBeenCalledWith();
});

it("SHOULD add the use case to a domain error AND rethrow it", async () => {
  const error = new GenericError();
  getWebPushKey.mockRejectedValue(error);

  await expect(useCase.execute()).rejects.toBe(error);
  expect(error.context).toMatchObject({
    useCase: "notification.getWebPushKeyUseCase",
  });
});

it("SHOULD rethrow an unknown error untouched", async () => {
  const error = new Error("x");
  getWebPushKey.mockRejectedValue(error);

  await expect(useCase.execute()).rejects.toBe(error);
});

it("SHOULD expose the unique name", () => {
  expect(useCase.uniqueName).toBe("notification.get_web_push_key_use_case");
});
