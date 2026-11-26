import { GenericError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import getNotificationSummaryPreviewUseCase from "./getNotificationSummaryPreviewUseCase";

const getSummaryPreview = jest.fn();
const useCase = getNotificationSummaryPreviewUseCase({
  notificationRepository: { getSummaryPreview },
} as unknown as Repositories);

beforeEach(() => jest.clearAllMocks());

it("SHOULD return what the repository returns", async () => {
  getSummaryPreview.mockResolvedValue("result");

  expect(await useCase.execute()).toBe("result");
  expect(getSummaryPreview).toHaveBeenCalledWith();
});

it("SHOULD add the use case to a domain error AND rethrow it", async () => {
  const error = new GenericError();
  getSummaryPreview.mockRejectedValue(error);

  await expect(useCase.execute()).rejects.toBe(error);
  expect(error.context).toMatchObject({
    useCase: "notification.getNotificationSummaryPreviewUseCase",
  });
});

it("SHOULD rethrow an unknown error untouched", async () => {
  const error = new Error("x");
  getSummaryPreview.mockRejectedValue(error);

  await expect(useCase.execute()).rejects.toBe(error);
});

it("SHOULD expose the unique name", () => {
  expect(useCase.uniqueName).toBe(
    "notification.get_notification_summary_preview_use_case",
  );
});
