import * as platform from "@utils/platform";

import { initialize, signIn, signOut } from "./index";
import * as RNGoogleSignIn from "./rnGoogleSignIn";

jest.mock("@utils/platform");
jest.mock("./rnGoogleSignIn");
const isWebSpy = jest.spyOn(platform, "isWeb").mockReturnValue(false);

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD call RNGoogleSignIn.initialize WHEN initialize is called", () => {
  initialize();

  expect(RNGoogleSignIn.initialize).toHaveBeenCalled();
});

it("SHOULD call RNGoogleSignIn.signIn WHEN signIn is called", async () => {
  await signIn();
  expect(RNGoogleSignIn.signIn).toHaveBeenCalled();
});

it("SHOULD call RNGoogleSignIn.signOut WHEN signOut is called", async () => {
  await signOut();
  expect(RNGoogleSignIn.signOut).toHaveBeenCalled();
});

it("SHOULD not call RNGoogleSignIn WHEN initialize is called on web", () => {
  isWebSpy.mockReturnValueOnce(true);

  initialize();

  expect(RNGoogleSignIn.initialize).not.toHaveBeenCalled();
});

it.each([signOut, signIn])(
  "SHOULD throw an error WHEN %p is called on web",
  async (func) => {
    isWebSpy.mockReturnValueOnce(true);

    try {
      await func();
    } catch (error) {
      expect((error as Error).message).toBe(
        "This library is not supported on web, use the supabase directly",
      );
    }
  },
);
