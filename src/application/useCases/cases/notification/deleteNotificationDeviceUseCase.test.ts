import { GenericError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import deleteNotificationDeviceUseCase from "./deleteNotificationDeviceUseCase";

const deleteDevice = jest.fn();
const useCase = deleteNotificationDeviceUseCase({
  notificationRepository: { deleteDevice },
} as unknown as Repositories);

beforeEach(() => jest.clearAllMocks());

it("SHOULD return what the repository returns", async () => {
  deleteDevice.mockResolvedValue("result");

  expect(await useCase.execute({ id: "x" } as never)).toBe("result");
  expect(deleteDevice).toHaveBeenCalledWith({ id: "x" });
});

it("SHOULD add the use case to a domain error AND rethrow it", async () => {
  const error = new GenericError();
  deleteDevice.mockRejectedValue(error);

  await expect(useCase.execute({} as never)).rejects.toBe(error);
  expect(error.context).toMatchObject({
    useCase: "notification.deleteNotificationDeviceUseCase",
  });
});

it("SHOULD rethrow an unknown error untouched", async () => {
  const error = new Error("x");
  deleteDevice.mockRejectedValue(error);

  await expect(useCase.execute({} as never)).rejects.toBe(error);
});

it("SHOULD expose the unique name", () => {
  expect(useCase.uniqueName).toBe(
    "notification.delete_notification_device_use_case",
  );
});
