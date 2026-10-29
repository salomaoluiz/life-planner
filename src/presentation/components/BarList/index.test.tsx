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

it("SHOULD show the average as a second line AND read it out WHEN the row has one", () => {
  setup({
    rows: [
      {
        average: "Avg R$ 50,00/mo",
        id: "a",
        label: "Groceries",
        percent: "60%",
        ratio: 1,
        value: "R$ 600,00",
      },
    ],
  });
  expect(screen.getByText("Avg R$ 50,00/mo")).toBeTruthy();
  expect(screen.getByTestId("bars-row-a-average")).toBeTruthy();
  expect(screen.getByTestId("bars-row-a").props.accessibilityLabel).toBe(
    "Groceries, R$ 600,00, 60%, Avg R$ 50,00/mo",
  );
});

it("SHOULD render a header AND an average cell per row in table mode, none for rows without one", () => {
  setup({
    columns: {
      average: "Avg/month",
      category: "Category",
      percent: "%",
      total: "Total",
    },
    rows: [
      {
        average: "R$ 50,00",
        id: "a",
        label: "Groceries",
        percent: "60%",
        ratio: 1,
        value: "R$ 600,00",
      },
      {
        id: "b",
        label: "Rent",
        percent: "40%",
        ratio: 0.5,
        value: "R$ 400,00",
      },
    ],
  });
  expect(screen.getByText("Avg/month")).toBeTruthy();
  expect(screen.getByText("Category")).toBeTruthy();
  expect(screen.getByTestId("bars-row-a-average")).toBeTruthy();
  expect(screen.queryByTestId("bars-row-b-average")).toBeNull();
});
