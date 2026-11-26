import { GenericError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import getUnreadNotificationCountUseCase from "./getUnreadNotificationCountUseCase";

const getUnreadCount = jest.fn();
const useCase = getUnreadNotificationCountUseCase({
  notificationRepository: { getUnreadCount },
} as unknown as Repositories);

beforeEach(() => jest.clearAllMocks());

it("SHOULD return what the repository returns", async () => {
  getUnreadCount.mockResolvedValue("result");

  expect(await useCase.execute()).toBe("result");
  expect(getUnreadCount).toHaveBeenCalledWith();
});

it("SHOULD add the use case to a domain error AND rethrow it", async () => {
  const error = new GenericError();
  getUnreadCount.mockRejectedValue(error);

  await expect(useCase.execute()).rejects.toBe(error);
  expect(error.context).toMatchObject({
    useCase: "notification.getUnreadNotificationCountUseCase",
  });
});

it("SHOULD rethrow an unknown error untouched", async () => {
  const error = new Error("x");
  getUnreadCount.mockRejectedValue(error);

  await expect(useCase.execute()).rejects.toBe(error);
});

it("SHOULD expose the unique name", () => {
  expect(useCase.uniqueName).toBe(
    "notification.get_unread_notification_count_use_case",
  );
});
