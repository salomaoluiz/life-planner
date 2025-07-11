import { BusinessError, DefaultError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/deleteFamilyUseCase.mocks";

it("SHOULD delete a family", async () => {
  await setup();

  expect(spies.familyRepository.deleteFamily).toHaveBeenCalledTimes(1);
  expect(spies.familyRepository.deleteFamily).toHaveBeenCalledWith(
    mocks.defaultParams.id,
  );
});

it("SHOULD throw an unknown error if anything throws", async () => {
  spies.familyRepository.deleteFamily.mockRejectedValueOnce(
    mocks.errors.unknown,
  );

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe(mocks.errors.unknown.message);
});

it("SHOULD throw the error if it is a DefaultError", async () => {
  spies.familyRepository.deleteFamily.mockRejectedValueOnce(
    mocks.errors.business,
  );

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(BusinessError);
  expect((error as DefaultError).context).toEqual({
    ...mocks.errors.business.context,
    useCase: "deleteFamilyUseCase",
  });
});
