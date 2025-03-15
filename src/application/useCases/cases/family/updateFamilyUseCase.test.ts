import {
  DefaultError,
  FieldRequired,
  GenericError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/updateFamilyUseCase.mocks";

it("SHOULD call the repositories", async () => {
  spies.updateFamily.mockResolvedValueOnce();

  await setup();

  expect(spies.updateFamily).toHaveBeenCalledTimes(1);
  expect(spies.updateFamily).toHaveBeenCalledWith({
    id: "123",
    name: "New Family",
  });
});

it.each(["id", "name", "id,name"])(
  `SHOULD throw a FieldRequired error if %s is missing`,
  async (fields) => {
    const fieldsToObj = fields
      .split(",")
      .reduce<Record<string, undefined>>((acc, field) => {
        acc[field] = undefined;
        return acc;
      }, {});

    const error = await throwableSetup(fieldsToObj);

    const expectedError = new FieldRequired({
      ...mocks.defaultProps,
      ...fieldsToObj,
    });
    expectedError.addContext({
      useCase: "updateFamilyUseCase",
    });

    expect(error).toBeInstanceOf(FieldRequired);
    expect((error as DefaultError).context).toEqual(expectedError.context);
    expect((error as DefaultError).message).toBe(
      `Fields ${fields} are required`,
    );
  },
);

it("SHOULD throw an unknown error if anything throws", async () => {
  const errorMock = new Error("User repository failed");
  spies.updateFamily.mockRejectedValueOnce(errorMock);

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe(errorMock.message);
});

it("SHOULD throw the error if it is a DefaultError", async () => {
  spies.updateFamily.mockRejectedValueOnce(new GenericError());

  const error = await throwableSetup();

  const expectedError = new GenericError();
  expectedError.addContext({
    useCase: "updateFamilyUseCase",
  });
  expect(error).toBeInstanceOf(GenericError);
  expect((error as DefaultError).context).toEqual(expectedError.context);
});
