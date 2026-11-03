import OwnerDTO from "@application/dto/user/OwnerDTO";
import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getOwnersUseCase.mocks";

it("SHOULD resolve the owners with one user repository call AND never ask the families", async () => {
  await setup();

  expect(spies.userRepository.getOwners).toHaveBeenCalledTimes(1);
  expect(spies.userRepository.getUser).not.toHaveBeenCalled();
  expect(spies.familyRepository.getFamilies).not.toHaveBeenCalled();
});

it("SHOULD return the families first AND the personal owner last", async () => {
  const result = await setup();

  expect(result).toEqual(
    mocks.owners.map(
      (owner) =>
        new OwnerDTO({
          archived: owner.archived,
          id: owner.ownerId,
          name: owner.name,
          type: owner.type,
        }),
    ),
  );
});

it("SHOULD flag the archived families (spec 042)", async () => {
  const result = await setup();

  expect(result.map((owner) => owner.archived)).toEqual([false, true, false]);
});

it("SHOULD return only the personal owner WHEN the user has no family", async () => {
  spies.userRepository.getOwners.mockResolvedValueOnce([mocks.owners[2]]);

  const result = await setup();

  expect(result.map((owner) => owner.id)).toEqual([mocks.owners[2].ownerId]);
});

it("SHOULD throw an error if the repository throws an error", async () => {
  spies.userRepository.getOwners.mockRejectedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toEqual(mocks.errors.unknown);
});

it("SHOULD throw BusinessError if the repository throws a BusinessError", async () => {
  spies.userRepository.getOwners.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("message", "Occurred a business error");
  expect(result).toHaveProperty("context", {
    any_context: "any context",
    useCase: "user.getOwnersUseCase",
  });
});
