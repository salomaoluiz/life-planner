import { GenericError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import getNotificationDevicesUseCase from "./getNotificationDevicesUseCase";

const getDevices = jest.fn();
const useCase = getNotificationDevicesUseCase({
  notificationRepository: { getDevices },
} as unknown as Repositories);

beforeEach(() => jest.clearAllMocks());

it("SHOULD return what the repository returns", async () => {
  getDevices.mockResolvedValue("result");

  expect(await useCase.execute()).toBe("result");
  expect(getDevices).toHaveBeenCalledWith();
});

it("SHOULD add the use case to a domain error AND rethrow it", async () => {
  const error = new GenericError();
  getDevices.mockRejectedValue(error);

  await expect(useCase.execute()).rejects.toBe(error);
  expect(error.context).toMatchObject({
    useCase: "notification.getNotificationDevicesUseCase",
  });
});

it("SHOULD rethrow an unknown error untouched", async () => {
  const error = new Error("x");
  getDevices.mockRejectedValue(error);

  await expect(useCase.execute()).rejects.toBe(error);
});

it("SHOULD expose the unique name", () => {
  expect(useCase.uniqueName).toBe(
    "notification.get_notification_devices_use_case",
  );
});
