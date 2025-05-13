import { BusinessError, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/loginWithGoogle.mocks";

describe("IF Web", () => {
  beforeEach(() => {
    spies.isWeb.mockReturnValueOnce(true);
  });

  it("SHOULD call just the loginWithOAuth", async () => {
    await setup();

    expect(spies.loginDatasource.loginWithOAuth).toHaveBeenCalledTimes(1);
    expect(spies.loginDatasource.loginWithIdToken).not.toHaveBeenCalled();
  });

  it("SHOULD return undefined", async () => {
    const result = await setup();

    expect(result).toBeUndefined();
  });
});

describe("IF Mobile", () => {
  beforeEach(() => {
    spies.isWeb.mockReturnValueOnce(false);
  });

  it("SHOULD call just loginWithIdToken", async () => {
    spies.isWeb.mockReturnValueOnce(false);
    spies.loginDatasource.loginWithIdToken.mockResolvedValueOnce(
      mocks.success.loginWithIdToken,
    );

    await setup();

    expect(spies.loginDatasource.loginWithOAuth).not.toHaveBeenCalled();
    expect(spies.loginDatasource.loginWithIdToken).toHaveBeenCalledTimes(1);
  });

  it("SHOULD return a LoginWithGoogleEntity", async () => {
    spies.loginDatasource.loginWithIdToken.mockResolvedValueOnce(
      mocks.success.loginWithIdToken,
    );

    const result = await setup();

    expect(result).toEqual(mocks.success.loginWithIdToken);
  });
});

it("SHOULD throw a BusinessError", async () => {
  spies.loginDatasource.loginWithIdToken.mockRejectedValueOnce(
    mocks.errors.business,
  );

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toEqual(mocks.errors.business);
  expect(result).toHaveProperty("context", {
    any_context: "any_context",
  });
});

it("SHOULD throw a GenericError", async () => {
  spies.loginDatasource.loginWithIdToken.mockRejectedValueOnce(
    mocks.errors.unknown,
  );

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(GenericError);
  expect(result).toHaveProperty("context", {
    error: mocks.errors.unknown,
    repository: "loginRepositoryImpl - loginWithGoogle",
  });
});
