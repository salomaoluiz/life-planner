import { GenericError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import getNotificationPreferencesUseCase from "./getNotificationPreferencesUseCase";

const getPreferences = jest.fn();
const useCase = getNotificationPreferencesUseCase({
  notificationRepository: { getPreferences },
} as unknown as Repositories);

beforeEach(() => jest.clearAllMocks());

it("SHOULD return what the repository returns", async () => {
  getPreferences.mockResolvedValue("result");

  expect(await useCase.execute()).toBe("result");
  expect(getPreferences).toHaveBeenCalledWith();
});

it("SHOULD add the use case to a domain error AND rethrow it", async () => {
  const error = new GenericError();
  getPreferences.mockRejectedValue(error);

  await expect(useCase.execute()).rejects.toBe(error);
  expect(error.context).toMatchObject({
    useCase: "notification.getNotificationPreferencesUseCase",
  });
});

it("SHOULD rethrow an unknown error untouched", async () => {
  const error = new Error("x");
  getPreferences.mockRejectedValue(error);

  await expect(useCase.execute()).rejects.toBe(error);
});

it("SHOULD expose the unique name", () => {
  expect(useCase.uniqueName).toBe(
    "notification.get_notification_preferences_use_case",
  );
});
