import { DefaultError, GenericError } from "@domain/entities/errors";

import {
  setup,
  spies,
  throwableSetup,
} from "./mocks/deleteFamilyUseCase.mocks";

it("SHOULD call the repositories", async () => {
  spies.deleteFamily.mockResolvedValueOnce(null as never);

  await setup();

  expect(spies.deleteFamily).toHaveBeenCalledTimes(1);
  expect(spies.deleteFamily).toHaveBeenCalledWith("123");
});

it("SHOULD throw an unknown error if anything throws", async () => {
  const errorMock = new Error("User repository failed");
  spies.deleteFamily.mockRejectedValueOnce(errorMock);

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe(errorMock.message);
});

it("SHOULD throw the error if it is a DefaultError", async () => {
  spies.deleteFamily.mockRejectedValueOnce(new GenericError());

  const error = await throwableSetup();

  const expectedError = new GenericError();
  expectedError.addContext({
    useCase: "deleteFamilyUseCase",
  });
  expect(error).toBeInstanceOf(GenericError);
  expect((error as DefaultError).context).toEqual(expectedError.context);
});
