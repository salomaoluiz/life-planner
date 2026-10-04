import {
  fireEvent,
  hasText,
  mocks,
  screen,
  setup,
  spies,
} from "./mocks/index.mocks";

function button(label: string) {
  return screen.UNSAFE_getAllByProps({ label })[0];
}

it("SHOULD render only the loading state WHEN the invite has not loaded", () => {
  setup({ loaded: false });

  expect(hasText("Loading")).toBe(true);
  expect(screen.UNSAFE_queryAllByProps({ label: "Accept" })).toHaveLength(0);
});

it("SHOULD render the invitation with the family name", () => {
  setup();

  expect(hasText("You have been invited to join the family")).toBe(true);
  expect(hasText("Test Family")).toBe(true);
  expect(hasText("Looks like this is invite is not for you")).toBe(false);
});

it("SHOULD enable Accept WHEN the invite email matches the signed-in user", () => {
  setup();

  expect(button("Accept").props.disabled).toBe(false);
});

it("SHOULD warn and disable Accept WHEN the invite is for someone else", () => {
  setup({ email: "someone-else@example.test" });

  expect(hasText("Looks like this is invite is not for you")).toBe(true);
  expect(button("Accept").props.disabled).toBe(true);
});

it("SHOULD join the family with the route token WHEN Accept is pressed", () => {
  const { mutate } = setup();

  fireEvent.press(button("Accept"));

  expect(mutate).toHaveBeenCalledWith({ inviteToken: "invite-token" });
});

it("SHOULD go home WHEN Decline is pressed", () => {
  const { mutate } = setup();

  fireEvent.press(button("Decline"));

  expect(spies.replace).toHaveBeenCalledWith("/(app)/(tabs)/index");
  expect(mutate).not.toHaveBeenCalled();
});

it("SHOULD go home WHEN the family was joined", () => {
  setup({ status: "success" });

  expect(spies.replace).toHaveBeenCalledWith("/(app)/(tabs)/index");
});

it("SHOULD NOT navigate on mount WHEN the join is idle", () => {
  setup();

  expect(spies.replace).not.toHaveBeenCalled();
});

it("SHOULD configure the join mutation with the use case", () => {
  setup();

  expect(spies.useMutation).toHaveBeenCalledWith({
    cacheKey: ["join_family"],
    fetch: mocks.useCases.joinFamilyMemberUseCase.execute,
  });
});

it("SHOULD build the invite view model from the token, user and family WHEN fetching", async () => {
  setup();
  const { cacheKey, fetch } = spies.useQuery.mock.calls[0][0];
  spies.decode.mockResolvedValue(mocks.routeProps);
  spies.getUser.mockResolvedValue(mocks.userDTO);
  spies.getFamily.mockResolvedValue(mocks.familyDTO);

  const result = await fetch();

  expect(cacheKey).toEqual(["get_family"]);
  expect(spies.decode).toHaveBeenCalledWith({ token: "invite-token" });
  expect(spies.getFamily).toHaveBeenCalledWith({ familyId: "family-1" });
  expect(result).toMatchObject({
    email: "bob@example.test",
    familyName: "Test Family",
  });
});
