import { StyleSheet } from "react-native";

import { fireEvent, hasText, screen, setup } from "./mocks/index.mocks";

it("SHOULD render only the skeleton WHEN loading", () => {
  setup({ status: "loading" });

  expect(screen.getByTestId("invite-skeleton")).toBeTruthy();
  expect(screen.queryByTestId("invite-accept")).toBeNull();
  expect(screen.queryByTestId("invite-decline")).toBeNull();
});

it("SHOULD render the invitation WHEN ready and the email matches", () => {
  const vm = setup();

  expect(screen.getByTestId("invite-tile")).toBeTruthy();
  expect(hasText("invite.title")).toBe(true);
  expect(screen.getByTestId("invite-family-name")).toHaveTextContent(
    "Test Family",
  );
  expect(hasText('invite.sentTo {"email":"bob@example.test"}')).toBe(true);
  expect(screen.queryByTestId("invite-mismatch")).toBeNull();
  expect(screen.getByTestId("invite-accept").props.accessibilityState).toEqual(
    expect.objectContaining({ busy: false, disabled: false }),
  );

  fireEvent.press(screen.getByTestId("invite-accept"));
  fireEvent.press(screen.getByTestId("invite-decline"));

  expect(vm.onAccept).toHaveBeenCalledTimes(1);
  expect(vm.onDecline).toHaveBeenCalledTimes(1);
});

it("SHOULD set Accept loading WHEN accepting and not call onAccept again", () => {
  const vm = setup({ isAccepting: true });

  const accept = screen.getByTestId("invite-accept");
  expect(accept.props.accessibilityState).toEqual(
    expect.objectContaining({ busy: true, disabled: true }),
  );
  fireEvent.press(accept);

  expect(vm.onAccept).not.toHaveBeenCalled();
});

it("SHOULD show the mismatch message and disable Accept WHEN the invite is for someone else", () => {
  const vm = setup({ matches: false });

  expect(screen.getByTestId("invite-mismatch")).toBeTruthy();
  expect(hasText('invite.notForYou {"email":"bob@example.test"}')).toBe(true);
  expect(screen.getByTestId("invite-accept").props.accessibilityState).toEqual(
    expect.objectContaining({ disabled: true }),
  );

  fireEvent.press(screen.getByTestId("invite-decline"));
  expect(vm.onDecline).toHaveBeenCalledTimes(1);
});

it("SHOULD show the accept error above the buttons", () => {
  setup({ acceptErrorKey: "invite.alreadyMember" });

  expect(screen.getByTestId("invite-accept-error")).toHaveTextContent(
    'invite.alreadyMember {"email":"bob@example.test"}',
  );
});

it.each([
  ["notFound", "invite.notFound"],
  ["expired", "invite.expired"],
] as const)(
  "SHOULD render the unavailable state WHEN %s",
  (status, message) => {
    const vm = setup({ status });

    expect(screen.getByTestId("invite-unavailable")).toBeTruthy();
    expect(hasText("invite.unavailableTitle")).toBe(true);
    expect(hasText(message)).toBe(true);
    expect(screen.queryByTestId("invite-accept")).toBeNull();

    fireEvent.press(screen.getByText("invite.goHome"));
    expect(vm.onGoHome).toHaveBeenCalledTimes(1);
  },
);

it("SHOULD render the error state and retry WHEN the load failed", () => {
  const vm = setup({ status: "error" });

  expect(screen.getByTestId("invite-error")).toBeTruthy();

  fireEvent.press(screen.getByText("common.actions.tryAgain"));
  expect(vm.onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD cap the content column at 480", () => {
  setup();

  expect(
    StyleSheet.flatten(screen.getByTestId("invite-column").props.style),
  ).toEqual(expect.objectContaining({ maxWidth: 480 }));
});
