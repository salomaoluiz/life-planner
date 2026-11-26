import { GenericError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import registerNotificationDeviceUseCase from "./registerNotificationDeviceUseCase";

const registerDevice = jest.fn();
const useCase = registerNotificationDeviceUseCase({
  notificationRepository: { registerDevice },
} as unknown as Repositories);

beforeEach(() => jest.clearAllMocks());

it("SHOULD return what the repository returns", async () => {
  registerDevice.mockResolvedValue("result");

  expect(await useCase.execute({ id: "x" } as never)).toBe("result");
  expect(registerDevice).toHaveBeenCalledWith({ id: "x" });
});

it("SHOULD add the use case to a domain error AND rethrow it", async () => {
  const error = new GenericError();
  registerDevice.mockRejectedValue(error);

  await expect(useCase.execute({} as never)).rejects.toBe(error);
  expect(error.context).toMatchObject({
    useCase: "notification.registerNotificationDeviceUseCase",
  });
});

it("SHOULD rethrow an unknown error untouched", async () => {
  const error = new Error("x");
  registerDevice.mockRejectedValue(error);

  await expect(useCase.execute({} as never)).rejects.toBe(error);
});

it("SHOULD expose the unique name", () => {
  expect(useCase.uniqueName).toBe(
    "notification.register_notification_device_use_case",
  );
});
