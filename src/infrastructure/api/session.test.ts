import { setup, spies } from "./mocks/session.mocks";

it("SHOULD clear token and cache, set the notice and notify listeners ONCE for parallel 401s", async () => {
  const listener = jest.fn();
  setup.onSessionExpired(listener);
  spies.tokenStorage.getToken.mockResolvedValue("old");

  await Promise.all([
    setup.handleSessionExpired("old"),
    setup.handleSessionExpired("old"),
    setup.handleSessionExpired("old"),
  ]);

  expect(spies.tokenStorage.clearToken).toHaveBeenCalledTimes(1);
  expect(spies.invalidateAll).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledTimes(1);
  expect(setup.hasSessionExpiredNotice()).toBe(true);
});

it("SHOULD ignore a late 401 from a token that is no longer the stored one", async () => {
  const listener = jest.fn();
  setup.onSessionExpired(listener);
  spies.tokenStorage.getToken.mockResolvedValue("new-token");

  await setup.handleSessionExpired("old");

  expect(spies.tokenStorage.clearToken).not.toHaveBeenCalled();
  expect(listener).not.toHaveBeenCalled();
  expect(setup.hasSessionExpiredNotice()).toBe(false);
});

it("SHOULD stop notifying a listener after it unsubscribes", async () => {
  const listener = jest.fn();
  const unsubscribe = setup.onSessionExpired(listener);
  unsubscribe();
  spies.tokenStorage.getToken.mockResolvedValue("old");

  await setup.handleSessionExpired("old");

  expect(listener).not.toHaveBeenCalled();
});

it("SHOULD clear the notice WHEN clearSessionExpiredNotice is called", async () => {
  spies.tokenStorage.getToken.mockResolvedValue("old");
  await setup.handleSessionExpired("old");

  setup.clearSessionExpiredNotice();

  expect(setup.hasSessionExpiredNotice()).toBe(false);
});
