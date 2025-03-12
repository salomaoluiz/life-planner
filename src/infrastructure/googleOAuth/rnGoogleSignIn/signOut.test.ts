import mocksSignOut from "./mocks/signOut";

const { mocks, setup, spies } = mocksSignOut;

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
    category: "react-native-google-signin",
    data: {
      message: "Google Sign Out Throws",
    },
    level: "error",
    message: "Error signing out with Google",
  });
});
