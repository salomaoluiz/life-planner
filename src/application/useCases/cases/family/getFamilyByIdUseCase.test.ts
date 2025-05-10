import FamilyDTO from "@application/dto/family/FamilyDTO";
import { BusinessError, DefaultError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/getFamilyByIdUseCase.mocks";

it("SHOULD get a family by its ID", async () => {
  spies.familyRepository.getFamilyById.mockResolvedValueOnce(
    mocks.familyEntity,
  );

  const result = await setup();

  expect(spies.familyRepository.getFamilyById).toHaveBeenCalledTimes(1);
  expect(spies.familyRepository.getFamilyById).toHaveBeenCalledWith(
    mocks.defaultParams.familyId,
  );
  expect(result).toEqual(FamilyDTO.fromEntity(mocks.familyEntity));
});

it("SHOULD throw an unknown error if anything throws", async () => {
  spies.familyRepository.getFamilyById.mockRejectedValueOnce(
    mocks.errors.unknown,
  );

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe(mocks.errors.unknown.message);
});

it("SHOULD throw the error if it is a DefaultError", async () => {
  spies.familyRepository.getFamilyById.mockRejectedValueOnce(
    mocks.errors.business,
  );

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(BusinessError);
  expect((error as DefaultError).context).toEqual({
    ...mocks.errors.business.context,
    useCase: "getFamilyByIdUseCase",
  });
});
