import { GenericError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import getActivityUseCase from "./getActivityUseCase";

const getActivity = jest.fn();
const useCase = getActivityUseCase({
  activityRepository: { getActivity },
} as unknown as Repositories);

beforeEach(() => jest.clearAllMocks());

it("SHOULD return what the repository returns", async () => {
  getActivity.mockResolvedValue("result");

  expect(await useCase.execute({ id: "x" } as never)).toBe("result");
  expect(getActivity).toHaveBeenCalledWith({ id: "x" });
});

it("SHOULD add the use case to a domain error AND rethrow it", async () => {
  const error = new GenericError();
  getActivity.mockRejectedValue(error);

  await expect(useCase.execute({} as never)).rejects.toBe(error);
  expect(error.context).toMatchObject({
    useCase: "activity.getActivityUseCase",
  });
});

it("SHOULD rethrow an unknown error untouched", async () => {
  const error = new Error("x");
  getActivity.mockRejectedValue(error);

  await expect(useCase.execute({} as never)).rejects.toBe(error);
});

it("SHOULD expose the unique name", () => {
  expect(useCase.uniqueName).toBe("activity.get_activity_use_case");
});
