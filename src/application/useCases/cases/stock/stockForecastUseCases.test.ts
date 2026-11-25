import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { GenericError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import dismissLeftoverUseCase from "./dismissLeftoverUseCase";
import getConsumptionWeeksUseCase from "./getConsumptionWeeksUseCase";
import getWasteUseCase from "./getWasteUseCase";

const repository = jest.mocked(repositoriesMocks.stockRepository);
const repositories = repositoriesMocks as unknown as Repositories;

beforeEach(() => jest.clearAllMocks());

it("SHOULD read the consumption weeks of an item through the repository", async () => {
  repository.getConsumptionWeeks.mockResolvedValue([]);

  expect(
    await getConsumptionWeeksUseCase(repositories).execute({ itemId: "i" }),
  ).toEqual([]);
  expect(repository.getConsumptionWeeks).toHaveBeenCalledWith({ itemId: "i" });
});

it("SHOULD read the waste of a month through the repository", async () => {
  const waste = { month: "2026-11" } as never;

  repository.getWaste.mockResolvedValue(waste);

  expect(
    await getWasteUseCase(repositories).execute({
      month: "2026-11",
      ownerId: "o",
    }),
  ).toBe(waste);
  expect(repository.getWaste).toHaveBeenCalledWith({
    month: "2026-11",
    ownerId: "o",
  });
});

it("SHOULD dismiss (and undo) the leftover warning of a lot", async () => {
  await dismissLeftoverUseCase(repositories).execute({
    dismissed: true,
    lotId: "lot",
  });

  expect(repository.dismissLeftover).toHaveBeenCalledWith({
    dismissed: true,
    lotId: "lot",
  });
});

it("SHOULD add its name to a DefaultError AND rethrow it", async () => {
  const error = new GenericError();

  repository.getWaste.mockRejectedValue(error);

  await expect(getWasteUseCase(repositories).execute({})).rejects.toBe(error);
  expect(error.context).toMatchObject({ useCase: "getWasteUseCase" });
});
