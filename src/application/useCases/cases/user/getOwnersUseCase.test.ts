import OwnerDTO from "@application/dto/user/OwnerDTO";
import { BusinessError } from "@domain/entities/errors";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getOwnersUseCase.mocks";

it("SHOULD call the user and families repository correctly", async () => {
  await setup();

  expect(spies.userRepository.getUser).toHaveBeenCalledTimes(1);
  expect(spies.familyRepository.getFamilies).toHaveBeenCalledTimes(1);
  expect(spies.familyRepository.getFamilies).toHaveBeenCalledWith(
    mocks.user.id,
  );
});

it("SHOULD return the correct owners", async () => {
  const result = await setup();

  const familiesOwners = mocks.families.map((family) => ({
    id: family.id,
    name: family.name,
    type: OwnerType.FAMILY,
  }));

  const expected = [
    ...familiesOwners,
    { id: mocks.user.id, name: mocks.user.name, type: OwnerType.USER },
  ].map((owner) => new OwnerDTO(owner));

  expect(result).toEqual(expected);
});

it("SHOULD throw an error if the repository throws an error", async () => {
  spies.userRepository.getUser.mockRejectedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toEqual(mocks.errors.unknown);
});

it("SHOULD throw BusinessError if the repository throws a BusinessError", async () => {
  spies.userRepository.getUser.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("message", "Occurred a business error");
  expect(result).toHaveProperty("context", {
    any_context: "any context",
    useCase: "user.getOwnersUseCase",
  });
});
