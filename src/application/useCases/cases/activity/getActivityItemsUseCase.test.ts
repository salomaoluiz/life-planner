import { GenericError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import getActivityItemsUseCase from "./getActivityItemsUseCase";

const getActivityItems = jest.fn();
const useCase = getActivityItemsUseCase({
  activityRepository: { getActivityItems },
} as unknown as Repositories);

beforeEach(() => jest.clearAllMocks());

it("SHOULD return what the repository returns", async () => {
  getActivityItems.mockResolvedValue("result");

  expect(await useCase.execute({ id: "x" } as never)).toBe("result");
  expect(getActivityItems).toHaveBeenCalledWith({ id: "x" });
});

it("SHOULD add the use case to a domain error AND rethrow it", async () => {
  const error = new GenericError();
  getActivityItems.mockRejectedValue(error);

  await expect(useCase.execute({} as never)).rejects.toBe(error);
  expect(error.context).toMatchObject({
    useCase: "activity.getActivityItemsUseCase",
  });
});

it("SHOULD rethrow an unknown error untouched", async () => {
  const error = new Error("x");
  getActivityItems.mockRejectedValue(error);

  await expect(useCase.execute({} as never)).rejects.toBe(error);
});

it("SHOULD expose the unique name", () => {
  expect(useCase.uniqueName).toBe("activity.get_activity_items_use_case");
});
