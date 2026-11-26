import { useCases } from "@application/useCases";
import { notificationsClient } from "@infrastructure/notifications";

import unregisterThisDevice from "./unregisterThisDevice";

jest.mock("@application/useCases", () => ({
  useCases: { deleteNotificationDeviceUseCase: { execute: jest.fn() } },
}));

beforeEach(() => jest.clearAllMocks());

it("SHOULD delete the registered device AND forget its id", async () => {
  jest.mocked(notificationsClient.getDeviceId).mockResolvedValue("d-1");

  await unregisterThisDevice();

  expect(useCases.deleteNotificationDeviceUseCase.execute).toHaveBeenCalledWith(
    { id: "d-1" },
  );
  expect(notificationsClient.clearDeviceId).toHaveBeenCalledTimes(1);
});

it("SHOULD do nothing WHEN this device was never registered", async () => {
  jest.mocked(notificationsClient.getDeviceId).mockResolvedValue(null);

  await unregisterThisDevice();

  expect(
    useCases.deleteNotificationDeviceUseCase.execute,
  ).not.toHaveBeenCalled();
});

it("SHOULD never block the logout WHEN the delete fails", async () => {
  jest.mocked(notificationsClient.getDeviceId).mockResolvedValue("d-1");
  jest
    .mocked(useCases.deleteNotificationDeviceUseCase.execute)
    .mockRejectedValue(new Error("offline"));

  await expect(unregisterThisDevice()).resolves.toBeUndefined();
});
