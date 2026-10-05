import { fireEvent, render, screen } from "@tests";

import MemberRow, { Props } from "./index";

function setup(overrides: Partial<Props> = {}) {
  const props: Props = {
    divider: false,
    isPending: false,
    name: "Bob Test",
    testID: "row",
    title: "Bob Test",
    ...overrides,
  };

  render(<MemberRow {...props} />);
}

it("SHOULD render the title, badge and options button", () => {
  setup({
    badge: { label: "Owner", tone: "neutral" },
    onOptionsPress: jest.fn(),
    optionsLabel: "Options",
  });

  expect(screen.getByText("Bob Test")).toBeOnTheScreen();
  expect(screen.getByTestId("row-badge")).toBeOnTheScreen();
  expect(screen.getByTestId("row-options")).toBeOnTheScreen();
});

it("SHOULD NOT render the options button WHEN there is no handler", () => {
  setup();

  expect(screen.queryByTestId("row-options")).toBeNull();
  expect(screen.queryByTestId("row-badge")).toBeNull();
});

it("SHOULD call onOptionsPress WHEN the options button is pressed", () => {
  const onOptionsPress = jest.fn();
  setup({ onOptionsPress, optionsLabel: "Options" });

  fireEvent.press(screen.getByTestId("row-options"));

  expect(onOptionsPress).toHaveBeenCalledTimes(1);
});

it("SHOULD render the avatar as pending WHEN the member is pending", () => {
  setup({ isPending: true });

  expect(screen.UNSAFE_getByProps({ pending: true })).toBeTruthy();
});

it("SHOULD render a long title without throwing", () => {
  setup({ title: "A very long member name ".repeat(10) });

  expect(screen.getByTestId("row")).toBeOnTheScreen();
});
