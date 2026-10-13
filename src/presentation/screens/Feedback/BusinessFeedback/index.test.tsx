import {
  BusinessFeedback,
  fireEvent,
  hasText,
  mocks,
  render,
  screen,
  setup,
  spies,
} from "./mocks/index.mocks";
import { FeedbackType } from "./types";

it("SHOULD render the loading state until the route is decoded", async () => {
  spies.decode.mockReturnValue(new Promise(() => undefined));
  render(<BusinessFeedback />);

  expect(hasText("Loading...")).toBe(true);
  expect(screen.UNSAFE_queryAllByProps({ label: "Copy Url" })).toHaveLength(0);
});

it("SHOULD decode the route params from the URL", async () => {
  await setup();

  expect(spies.decode).toHaveBeenCalledWith({ feedback: "encoded" });
});

it("SHOULD NOT decode WHEN there are no route params", () => {
  spies.params.mockReturnValue(undefined as never);

  render(<BusinessFeedback />);

  expect(spies.decode).not.toHaveBeenCalled();
  expect(hasText("Loading...")).toBe(true);
});

it("SHOULD render the title, message and primary button WHEN decoded", async () => {
  await setup();

  expect(hasText("Invite sent")).toBe(true);
  expect(hasText("The invite was sent")).toBe(true);
  expect(
    screen.UNSAFE_getAllByProps({ label: "Copy Url" }).length,
  ).toBeGreaterThan(0);
});

it.each([
  [FeedbackType.Error, "close-circle", "expense"],
  [FeedbackType.Information, "information", "accent"],
  [FeedbackType.Success, "check-circle", "income"],
  [FeedbackType.Warning, "alert", "warning"],
] as const)(
  "SHOULD show the %s icon %s with the %s color",
  async (type, icon, color) => {
    await setup(type);

    expect(
      screen.UNSAFE_getAllByProps({ source: icon }).at(-1)?.props.color,
    ).toBe(mocks.theme().colors[color]);
  },
);

it("SHOULD run the primary action WHEN the primary button is pressed", async () => {
  await setup();

  fireEvent.press(screen.UNSAFE_getAllByProps({ label: "Copy Url" })[0]);

  expect(spies.handleAction).toHaveBeenCalledWith(mocks.primaryButton);
});

it("SHOULD run the close action WHEN the close button is pressed", async () => {
  await setup();

  fireEvent.press(screen.getAllByLabelText("common.actions.close")[0]);

  expect(spies.handleAction).toHaveBeenCalledWith(mocks.closeButton);
});

it("SHOULD use the primary text color for the close button", async () => {
  await setup();

  const close = screen.UNSAFE_getAllByProps({ source: "close-circle" })[0];

  expect(close.props.color).toBe(mocks.theme().colors.textPrimary);
});
