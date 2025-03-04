import { setup, mocks, spies } from "./mocks/loginDatasourceImpl_logout";
import { GenericError } from "@domain/entities/errors";

it("SHOULD logout", async () => {
  spies.signOut.mockResolvedValueOnce(mocks.signOutSuccess as never);

  await setup();

  expect(spies.signOut).toHaveBeenCalledTimes(1);
});

it("SHOULD throw an GenericError if signOut fails", async () => {
  spies.signOut.mockResolvedValueOnce(mocks.signOutError as never);

  function func() {
    return setup();
  }

  await expect(func).rejects.toThrow(
    new GenericError(mocks.signOutError.error.message),
  );
});
