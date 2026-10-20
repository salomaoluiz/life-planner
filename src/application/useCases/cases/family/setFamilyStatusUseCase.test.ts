import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { FamilyHasPendingItems, FieldRequired } from "@domain/entities/errors";
import { FamilyStatus } from "@domain/entities/family/FamilyStatus";

import setFamilyStatusUseCase from "./setFamilyStatusUseCase";

const familyRepository = jest.mocked(repositoriesMocks.familyRepository);

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD send only the status to the repository", async () => {
  await setFamilyStatusUseCase(repositoriesMocks).execute({
    id: "family-id",
    status: FamilyStatus.ARCHIVED,
  });

  expect(familyRepository.updateFamily).toHaveBeenCalledWith({
    id: "family-id",
    status: FamilyStatus.ARCHIVED,
  });
});

it("SHOULD throw FieldRequired WHEN the id is missing", async () => {
  await expect(
    setFamilyStatusUseCase(repositoriesMocks).execute({
      id: "",
      status: FamilyStatus.ARCHIVED,
    }),
  ).rejects.toBeInstanceOf(FieldRequired);
});

it("SHOULD re-throw the pending-items error with the use case context", async () => {
  familyRepository.updateFamily.mockRejectedValueOnce(
    new FamilyHasPendingItems({}),
  );

  const error = await setFamilyStatusUseCase(repositoriesMocks)
    .execute({ id: "family-id", status: FamilyStatus.ARCHIVED })
    .catch((caught) => caught);

  expect(error).toBeInstanceOf(FamilyHasPendingItems);
  expect(error.context).toEqual({ useCase: "setFamilyStatusUseCase" });
});

it("SHOULD re-throw an unknown error as is", async () => {
  const unknown = new Error("boom");
  familyRepository.updateFamily.mockRejectedValueOnce(unknown);

  await expect(
    setFamilyStatusUseCase(repositoriesMocks).execute({
      id: "family-id",
      status: FamilyStatus.ACTIVE,
    }),
  ).rejects.toBe(unknown);
});
