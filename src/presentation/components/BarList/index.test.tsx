import { fireEvent, screen } from "@tests";

import { onPress, setup } from "./mocks/index.mocks";

beforeEach(() => jest.clearAllMocks());

it("SHOULD render each row with its amount, share AND suffix", () => {
  setup();
  expect(screen.getByText("R$ 600,00")).toBeTruthy();
  expect(screen.getByText("60%")).toBeTruthy();
  expect(screen.getByText("Rent · Archived")).toBeTruthy();
});

it("SHOULD open a row with its id AND label it for screen readers", () => {
  setup();
  const row = screen.getByTestId("bars-row-a");

  expect(row.props.accessibilityLabel).toBe("Groceries, R$ 600,00, 60%");
  fireEvent.press(row);
  expect(onPress).toHaveBeenCalledWith("a");
});

it("SHOULD not open a muted row", () => {
  setup();
  fireEvent.press(screen.getByTestId("bars-row-other"));
  expect(onPress).not.toHaveBeenCalledWith("other");
});

it("SHOULD be read-only without onPress", () => {
  setup({ onPress: undefined });
  fireEvent.press(screen.getByTestId("bars-row-a"));
  expect(onPress).not.toHaveBeenCalledWith("a");
});
