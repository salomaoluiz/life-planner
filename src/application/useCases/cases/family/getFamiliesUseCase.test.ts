import { DefaultError, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/getFamiliesUseCase.mocks";

it("SHOULD call the repositories", async () => {
  spies.getUser.mockResolvedValueOnce(mocks.userSuccess as never);
  spies.getFamilies.mockResolvedValueOnce(mocks.familiesSuccess as never);

  await setup();

  expect(spies.getUser).toHaveBeenCalledTimes(1);
  expect(spies.getUser).toHaveBeenCalledWith();
  expect(spies.getFamilies).toHaveBeenCalledTimes(1);
  expect(spies.getFamilies).toHaveBeenCalledWith(mocks.userSuccess.id);
});

it("SHOULD return the families if everything goes well", async () => {
  spies.getUser.mockResolvedValueOnce(mocks.userSuccess as never);
  spies.getFamilies.mockResolvedValueOnce(mocks.familiesSuccess as never);

  const families = await setup();

  expect(families).toEqual(mocks.familiesSuccess);
});

it("SHOULD throw an unknown error if anything throws", async () => {
  const errorMock = new Error("User repository failed");
  spies.getUser.mockRejectedValueOnce(errorMock);

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe(errorMock.message);
});

it("SHOULD throw the error if it is a DefaultError", async () => {
  spies.getUser.mockRejectedValueOnce(new GenericError());

  const error = await throwableSetup();

  const expectedError = new GenericError();
  expectedError.addContext({
    useCase: "getFamiliesUseCase",
  });
  expect(error).toBeInstanceOf(GenericError);
  expect((error as DefaultError).context).toEqual(expectedError.context);
});
