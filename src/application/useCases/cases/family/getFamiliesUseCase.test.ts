import FamilyDTO from "@application/dto/family/FamilyDTO";
import { BusinessError, DefaultError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/getFamiliesUseCase.mocks";

it("SHOULD get all user families", async () => {
  spies.userRepository.getUser.mockResolvedValueOnce(mocks.userEntity);
  spies.familyRepository.getFamilies.mockResolvedValueOnce(
    mocks.familyEntities,
  );

  const result = await setup();

  expect(spies.userRepository.getUser).toHaveBeenCalledTimes(1);
  expect(spies.userRepository.getUser).toHaveBeenCalledWith();
  expect(spies.familyRepository.getFamilies).toHaveBeenCalledTimes(1);
  expect(spies.familyRepository.getFamilies).toHaveBeenCalledWith(
    mocks.userEntity.id,
  );
  expect(result).toEqual(
    mocks.familyEntities.map((entity) => FamilyDTO.fromEntity(entity)),
  );
});

it("SHOULD throw an unknown error if anything throws", async () => {
  spies.userRepository.getUser.mockRejectedValueOnce(mocks.errors.unknown);

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe(mocks.errors.unknown.message);
});

it("SHOULD throw the error if it is a DefaultError", async () => {
  spies.userRepository.getUser.mockRejectedValueOnce(mocks.errors.business);

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(BusinessError);
  expect((error as DefaultError).context).toEqual({
    ...mocks.errors.business.context,
    useCase: "getFamiliesUseCase",
  });
});
