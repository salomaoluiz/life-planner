import { fireEvent, hasText, mocks, screen, setup } from "./mocks/index.mocks";

function actionButton(label: string) {
  return screen.UNSAFE_getAllByProps({ label })[0];
}

function expand() {
  fireEvent.press(screen.UNSAFE_getByType(mocks.Accordion.Item));
}

it("SHOULD render the member name, avatar and the Owner label", () => {
  setup({ row: "owner", viewer: mocks.owner });

  expect(hasText("Alice Test")).toBe(true);
  expect(hasText("family.member.role.owner")).toBe(true);
  expect(screen.UNSAFE_getByType(mocks.Avatar.Small).props).toMatchObject({
    mode: "image",
    source: "https://example.test/alice.png",
  });
});

it("SHOULD show the email AND the Pending label for a pending invite", () => {
  setup({ row: "pending", viewer: mocks.owner });

  expect(hasText("bob@example.test")).toBe(true);
  expect(hasText("family.member.status.pending")).toBe(true);
});

it("SHOULD show no status label for a plain joined member", () => {
  setup({ row: "joined", viewer: mocks.owner });

  expect(hasText("Carol Test")).toBe(true);
  expect(hasText("family.member.status.pending")).toBe(false);
  expect(hasText("family.member.role.owner")).toBe(false);
});

it("SHOULD NOT be expandable (no action) for the owner row", () => {
  setup({ row: "owner", viewer: mocks.owner });

  expect(screen.UNSAFE_getByType(mocks.Accordion.Item).props.onPress).toBe(
    undefined,
  );
});

it.each([
  ["pending", mocks.owner, "family.member.cancelInvite"],
  ["joined", mocks.owner, "family.member.remove"],
  ["joined", mocks.member, "family.member.leave"],
] as const)(
  "SHOULD show the %s row action %s only after expanding",
  (row, viewer, label) => {
    setup({ row, viewer });
    expect(screen.UNSAFE_queryAllByProps({ label })).toHaveLength(0);

    expand();

    expect(actionButton(label)).toBeTruthy();
  },
);

it("SHOULD delete the member WHEN the action is pressed", () => {
  const { mutate } = setup({ row: "pending", viewer: mocks.owner });
  expand();

  fireEvent.press(actionButton("family.member.cancelInvite"));

  expect(mutate).toHaveBeenCalledWith({ id: "member-2" });
});

it("SHOULD disable the action while deleting", () => {
  setup({ isFetching: true, row: "joined", viewer: mocks.owner });
  expand();

  expect(actionButton("family.member.remove").props.disabled).toBe(true);
});
