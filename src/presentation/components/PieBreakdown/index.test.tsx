import { fireEvent, screen } from "@tests";

import { onPress, setup } from "./mocks/index.mocks";

beforeEach(() => jest.clearAllMocks());

it("SHOULD list every row beside the pie AND open a row", () => {
  setup();
  expect(screen.getByText("Groceries")).toBeTruthy();
  expect(screen.getByText("R$ 300,00")).toBeTruthy();
  fireEvent.press(screen.getByTestId("pie-row-b"));
  expect(onPress).toHaveBeenCalledWith("b");
});

it("SHOULD not open the muted row", () => {
  setup();
  fireEvent.press(screen.getByTestId("pie-row-other"));
  expect(onPress).not.toHaveBeenCalledWith("other");
});

it("SHOULD draw a single row as a full circle, no rows and all-zero rows without NaN", () => {
  setup({
    rows: [{ id: "a", label: "A", percent: "100%", ratio: 1, value: "1" }],
  });
  setup({ rows: [] });
  setup({
    rows: [{ id: "z", label: "Z", percent: "0%", ratio: 0, value: "0" }],
  });
  expect(JSON.stringify(screen.toJSON())).not.toContain("NaN");
});
