import {
  fireEvent,
  hasText,
  mocks,
  screen,
  setup,
  spies,
} from "./mocks/index.mocks";

function deleteButton() {
  return screen.UNSAFE_getAllByProps({ label: "Delete Family Member" })[0];
}

function expand() {
  fireEvent.press(screen.UNSAFE_getByType(mocks.Accordion.Item));
}

it("SHOULD render the member name and avatar", () => {
  setup();

  expect(hasText("Alice Test")).toBe(true);
  expect(screen.UNSAFE_getByType(mocks.Avatar.Small).props).toMatchObject({
    mode: "image",
    source: "https://example.test/alice.png",
  });
});

it("SHOULD show the member email WHEN the member has no user", () => {
  setup({ member: mocks.invitedMember });

  expect(hasText("bob@example.test")).toBe(true);
});

it("SHOULD configure the delete mutation with the use case", () => {
  setup();

  expect(spies.useMutation).toHaveBeenCalledWith({
    cacheKey: ["delete_member"],
    fetch: mocks.useCases.deleteFamilyMemberUseCase.execute,
  });
});

it("SHOULD hide the delete button WHEN collapsed and show it WHEN pressed", () => {
  setup();
  expect(
    screen.UNSAFE_queryAllByProps({ label: "Delete Family Member" }),
  ).toHaveLength(0);

  expand();

  expect(deleteButton()).toBeTruthy();
});

it("SHOULD hide the delete button again WHEN pressed twice", () => {
  setup();

  expand();
  expand();

  expect(
    screen.UNSAFE_queryAllByProps({ label: "Delete Family Member" }),
  ).toHaveLength(0);
});

it("SHOULD disable the delete button WHEN the member is the family owner", () => {
  setup({ ownerId: "member-1" });
  expand();

  expect(deleteButton().props.disabled).toBe(true);
});

it("SHOULD enable the delete button WHEN the member is not the family owner", () => {
  setup({ member: mocks.invitedMember, ownerId: "member-1" });
  expand();

  expect(deleteButton().props.disabled).toBe(false);
});

it("SHOULD delete the member WHEN the delete button is pressed", () => {
  const { mutate } = setup({ member: mocks.invitedMember });
  expand();

  fireEvent.press(deleteButton());

  expect(mutate).toHaveBeenCalledWith({ id: "member-2" });
});

it("SHOULD refetch the family WHEN the delete succeeded", () => {
  setup({ status: "success" });

  expect(mocks.refetchFamily).toHaveBeenCalledTimes(1);
});

it.each(["idle", "error"] as const)(
  "SHOULD NOT refetch the family WHEN the delete status is %s",
  (status) => {
    setup({ status });

    expect(mocks.refetchFamily).not.toHaveBeenCalled();
  },
);
