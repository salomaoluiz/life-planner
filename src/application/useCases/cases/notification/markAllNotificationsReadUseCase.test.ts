import { GenericError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import markAllNotificationsReadUseCase from "./markAllNotificationsReadUseCase";

const markAllRead = jest.fn();
const useCase = markAllNotificationsReadUseCase({
  notificationRepository: { markAllRead },
} as unknown as Repositories);

beforeEach(() => jest.clearAllMocks());

it("SHOULD return what the repository returns", async () => {
  markAllRead.mockResolvedValue("result");

  expect(await useCase.execute()).toBe("result");
  expect(markAllRead).toHaveBeenCalledWith();
});

it("SHOULD add the use case to a domain error AND rethrow it", async () => {
  const error = new GenericError();
  markAllRead.mockRejectedValue(error);

  await expect(useCase.execute()).rejects.toBe(error);
  expect(error.context).toMatchObject({
    useCase: "notification.markAllNotificationsReadUseCase",
  });
});

it("SHOULD rethrow an unknown error untouched", async () => {
  const error = new Error("x");
  markAllRead.mockRejectedValue(error);

  await expect(useCase.execute()).rejects.toBe(error);
});

it("SHOULD expose the unique name", () => {
  expect(useCase.uniqueName).toBe(
    "notification.mark_all_notifications_read_use_case",
  );
});
