import { GenericError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import markNotificationDeviceSeenUseCase from "./markNotificationDeviceSeenUseCase";

const markDeviceSeen = jest.fn();
const useCase = markNotificationDeviceSeenUseCase({
  notificationRepository: { markDeviceSeen },
} as unknown as Repositories);

beforeEach(() => jest.clearAllMocks());

it("SHOULD return what the repository returns", async () => {
  markDeviceSeen.mockResolvedValue("result");

  expect(await useCase.execute({ id: "x" } as never)).toBe("result");
  expect(markDeviceSeen).toHaveBeenCalledWith({ id: "x" });
});

it("SHOULD add the use case to a domain error AND rethrow it", async () => {
  const error = new GenericError();
  markDeviceSeen.mockRejectedValue(error);

  await expect(useCase.execute({} as never)).rejects.toBe(error);
  expect(error.context).toMatchObject({
    useCase: "notification.markNotificationDeviceSeenUseCase",
  });
});

it("SHOULD rethrow an unknown error untouched", async () => {
  const error = new Error("x");
  markDeviceSeen.mockRejectedValue(error);

  await expect(useCase.execute({} as never)).rejects.toBe(error);
});

it("SHOULD expose the unique name", () => {
  expect(useCase.uniqueName).toBe(
    "notification.mark_notification_device_seen_use_case",
  );
});
