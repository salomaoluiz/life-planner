import mocksSignOut from "./mocks/signOut";

const { setup, spies, mocks } = mocksSignOut;

it("SHOULD sign out correctly", async () => {
  await setup();

  expect(spies.signOutSpy).toHaveBeenCalledTimes(1);
});

it("SHOULD add breadcrumb when sign out fails", async () => {
  spies.signOutSpy.mockRejectedValue(mocks.failError);

  await setup();

  expect(spies.signOutSpy).toHaveBeenCalledTimes(1);
  expect(spies.addBreadcrumbSpy).toHaveBeenCalledTimes(1);
  expect(spies.addBreadcrumbSpy).toHaveBeenCalledWith({
    level: "error",
    category: "react-native-google-signin",
    message: "Error signing out with Google",
    data: {
      message: "Google Sign Out Throws",
    },
  });
});
