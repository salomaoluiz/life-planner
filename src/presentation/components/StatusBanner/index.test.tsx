import { screen } from "@tests";

import { setup, spies } from "./mocks/index.mocks";

it("SHOULD show the message as a polite status", () => {
  setup();

  expect(screen.getByText("A new app version (1.5.0) is live.")).toBeTruthy();
  const banner = screen.getByTestId("banner");
  expect(banner.props.role).toBe("status");
  expect(banner.props.accessibilityLiveRegion).toBe("polite");
});

it("SHOULD call onAction AND onDismiss from their buttons", () => {
  const { action, dismiss, press } = setup();

  press(action());
  press(dismiss());

  expect(spies.onAction).toHaveBeenCalledTimes(1);
  expect(spies.onDismiss).toHaveBeenCalledTimes(1);
});

it("SHOULD hide the action AND the dismiss WHEN their handlers are missing", () => {
  setup({ onAction: undefined, onDismiss: undefined });

  expect(screen.queryByTestId("banner-action")).toBeNull();
  expect(screen.queryByTestId("banner-dismiss")).toBeNull();
});

it("SHOULD not render the action without a label", () => {
  setup({ actionLabel: undefined });

  expect(screen.queryByTestId("banner-action")).toBeNull();
});

it("SHOULD fall back to the default dismiss label", () => {
  setup({ dismissLabel: undefined });

  expect(screen.getByLabelText("Dismiss")).toBeTruthy();
});
