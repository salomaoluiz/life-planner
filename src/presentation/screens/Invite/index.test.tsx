import { fireEvent, hasText, screen, setup } from "./mocks/index.mocks";

function button(label: string) {
  return screen.UNSAFE_getAllByProps({ label })[0];
}

it("SHOULD render only the skeleton WHEN loading", () => {
  setup({ status: "loading" });

  expect(screen.getAllByTestId("skeleton-loader").length).toBeGreaterThan(0);
  expect(
    screen.UNSAFE_queryAllByProps({ label: "invite.accept" }),
  ).toHaveLength(0);
});

it("SHOULD render the not-found message and no buttons", () => {
  setup({ status: "notFound" });

  expect(hasText("invite.notFound")).toBe(true);
  expect(
    screen.UNSAFE_queryAllByProps({ label: "invite.accept" }),
  ).toHaveLength(0);
});

it("SHOULD render the expired message", () => {
  setup({ status: "expired" });

  expect(hasText("invite.expired")).toBe(true);
});

it("SHOULD render the generic message on other errors", () => {
  setup({ status: "error" });

  expect(hasText("errors.generic.description")).toBe(true);
});

it("SHOULD render the invitation with an enabled Accept WHEN the email matches", () => {
  setup();

  expect(hasText("invite.title")).toBe(true);
  expect(hasText("Test Family")).toBe(true);
  expect(hasText('invite.notForYou {"email":"bob@example.test"}')).toBe(false);
  expect(button("invite.accept").props.disabled).toBe(false);
});

it("SHOULD warn and disable Accept WHEN the invite is for someone else", () => {
  setup({ matches: false });

  expect(hasText('invite.notForYou {"email":"bob@example.test"}')).toBe(true);
  expect(button("invite.accept").props.disabled).toBe(true);
});

it("SHOULD disable Accept while accepting (blocks double taps)", () => {
  setup({ isAccepting: true });

  expect(button("invite.accept").props.disabled).toBe(true);
});

it("SHOULD show the accept error message", () => {
  setup({ acceptErrorKey: "invite.alreadyMember" });

  expect(hasText('invite.alreadyMember {"email":"bob@example.test"}')).toBe(
    true,
  );
});

it("SHOULD call onAccept and onDecline from the buttons", () => {
  const vm = setup();

  fireEvent.press(button("invite.accept"));
  fireEvent.press(button("invite.decline"));

  expect(vm.onAccept).toHaveBeenCalledTimes(1);
  expect(vm.onDecline).toHaveBeenCalledTimes(1);
});
