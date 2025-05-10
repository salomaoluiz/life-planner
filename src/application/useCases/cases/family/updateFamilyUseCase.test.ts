import {
  BusinessError,
  DefaultError,
  FieldRequired,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/updateFamilyUseCase.mocks";

it("SHOULD call the repositories", async () => {
  spies.familyRepository.updateFamily.mockResolvedValueOnce();

  await setup();

  expect(spies.familyRepository.updateFamily).toHaveBeenCalledTimes(1);
  expect(spies.familyRepository.updateFamily).toHaveBeenCalledWith({
    id: mocks.defaultParams.id,
    name: mocks.defaultParams.name,
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
      ...mocks.defaultParams,
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
  spies.familyRepository.updateFamily.mockRejectedValueOnce(
    mocks.errors.unknown,
  );

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe(mocks.errors.unknown.message);
});

it("SHOULD throw the error if it is a DefaultError", async () => {
  spies.familyRepository.updateFamily.mockRejectedValueOnce(
    mocks.errors.business,
  );

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(BusinessError);
  expect((error as DefaultError).context).toEqual({
    ...mocks.errors.business.context,
    useCase: "updateFamilyUseCase",
  });
});
