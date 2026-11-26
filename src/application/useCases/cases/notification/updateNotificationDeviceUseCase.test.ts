import { GenericError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import updateNotificationDeviceUseCase from "./updateNotificationDeviceUseCase";

const updateDevice = jest.fn();
const useCase = updateNotificationDeviceUseCase({
  notificationRepository: { updateDevice },
} as unknown as Repositories);

beforeEach(() => jest.clearAllMocks());

it("SHOULD return what the repository returns", async () => {
  updateDevice.mockResolvedValue("result");

  expect(await useCase.execute({ id: "x" } as never)).toBe("result");
  expect(updateDevice).toHaveBeenCalledWith({ id: "x" });
});

it("SHOULD add the use case to a domain error AND rethrow it", async () => {
  const error = new GenericError();
  updateDevice.mockRejectedValue(error);

  await expect(useCase.execute({} as never)).rejects.toBe(error);
  expect(error.context).toMatchObject({
    useCase: "notification.updateNotificationDeviceUseCase",
  });
});

it("SHOULD rethrow an unknown error untouched", async () => {
  const error = new Error("x");
  updateDevice.mockRejectedValue(error);

  await expect(useCase.execute({} as never)).rejects.toBe(error);
});

it("SHOULD expose the unique name", () => {
  expect(useCase.uniqueName).toBe(
    "notification.update_notification_device_use_case",
  );
});
