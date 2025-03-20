import { GenericError, LoginCanceledError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
} from "./mocks/loginDatasourceImpl_loginWithIdToken";

// TODO: Fix after TCC
// it("SHOULD login with IdToken", async () => {
//   spies.signIn.mockResolvedValueOnce(mocks.signInSuccess);
//
//   const result = await setup();
//
//   expect(spies.signIn).toHaveBeenCalledTimes(1);
//   expect(spies.signIn).toHaveBeenCalledWith();
//   expect(spies.signInWithIdToken).toHaveBeenCalledTimes(1);
//   expect(spies.signInWithIdToken).toHaveBeenCalledWith({
//     provider: "google",
//     token: mocks.signInSuccess.data.token,
//   });
//   expect(result).toBeTruthy();
// });

it("SHOULD throw an GenericError if signIn fails", async () => {
  spies.signIn.mockResolvedValueOnce(mocks.signInError);

  async function func() {
    return setup();
  }
  await expect(func).rejects.toThrow(new GenericError());
});

it("SHOULD throw an BusinessError if signIn is canceled", async () => {
  spies.signIn.mockResolvedValueOnce(mocks.signInCanceled);

  async function func() {
    return setup();
  }
  await expect(func).rejects.toThrow(new LoginCanceledError());
});
