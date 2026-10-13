import { GenericError } from "@domain/entities/errors";

import { mocks, setup } from "./mocks/familyMemberApiError.mocks";

it("SHOULD throw the mapped error WHEN the status is in the map", () => {
  expect(setup(mocks.errors.api404)).toBe(mocks.mapped);
});

it("SHOULD wrap an ApiBusinessError whose status is NOT mapped in a GenericError", () => {
  const thrown = setup(mocks.errors.api403);

  expect(thrown).toBeInstanceOf(GenericError);
  expect(thrown).toHaveProperty("context", {
    ...mocks.context,
    error: mocks.errors.api403,
  });
});

it.each([
  ["ConnectivityError", mocks.errors.connectivity],
  ["UserNotLoggedError", mocks.errors.notLogged],
])("SHOULD re-throw %s untouched (handled globally)", (_name, error) => {
  expect(setup(error)).toBe(error);
});

it("SHOULD wrap unknown errors in a GenericError with the context", () => {
  const thrown = setup(mocks.errors.unknown);

  expect(thrown).toBeInstanceOf(GenericError);
  expect(thrown).toHaveProperty("context", {
    ...mocks.context,
    error: mocks.errors.unknown,
  });
});
