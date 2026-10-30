import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import getCategoryIconsUseCase from "./getCategoryIconsUseCase";

const repository = jest.mocked(repositoriesMocks.financialRepository.category);
const icon = {
  common: true,
  group: "FOOD",
  labelEn: "Food",
  labelPt: "Comida",
  name: "food",
};

beforeEach(() => {
  jest.clearAllMocks();
  repository.getCategoryIcons.mockResolvedValue([icon]);
});

it("SHOULD return DTOs and pass q / limit to the repository", async () => {
  const result = await getCategoryIconsUseCase(repositoriesMocks).execute({
    limit: 10,
    q: "pasta",
  });

  expect(repository.getCategoryIcons).toHaveBeenCalledWith({
    limit: 10,
    q: "pasta",
  });
  expect(result).toEqual([icon]);
});

it("SHOULD re-throw errors", async () => {
  const error = new BusinessError();

  repository.getCategoryIcons.mockRejectedValueOnce(error);
  await expect(
    getCategoryIconsUseCase(repositoriesMocks).execute({}),
  ).rejects.toBe(error);

  repository.getCategoryIcons.mockRejectedValueOnce(new Error("x"));
  await expect(
    getCategoryIconsUseCase(repositoriesMocks).execute({}),
  ).rejects.toThrow("x");
});
