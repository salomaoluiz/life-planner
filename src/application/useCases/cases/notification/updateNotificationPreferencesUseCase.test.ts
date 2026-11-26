import { GenericError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import updateNotificationPreferencesUseCase from "./updateNotificationPreferencesUseCase";

const updatePreferences = jest.fn();
const useCase = updateNotificationPreferencesUseCase({
  notificationRepository: { updatePreferences },
} as unknown as Repositories);

beforeEach(() => jest.clearAllMocks());

it("SHOULD return what the repository returns", async () => {
  updatePreferences.mockResolvedValue("result");

  expect(await useCase.execute({ id: "x" } as never)).toBe("result");
  expect(updatePreferences).toHaveBeenCalledWith({ id: "x" });
});

it("SHOULD add the use case to a domain error AND rethrow it", async () => {
  const error = new GenericError();
  updatePreferences.mockRejectedValue(error);

  await expect(useCase.execute({} as never)).rejects.toBe(error);
  expect(error.context).toMatchObject({
    useCase: "notification.updateNotificationPreferencesUseCase",
  });
});

it("SHOULD rethrow an unknown error untouched", async () => {
  const error = new Error("x");
  updatePreferences.mockRejectedValue(error);

  await expect(useCase.execute({} as never)).rejects.toBe(error);
});

it("SHOULD expose the unique name", () => {
  expect(useCase.uniqueName).toBe(
    "notification.update_notification_preferences_use_case",
  );
});
