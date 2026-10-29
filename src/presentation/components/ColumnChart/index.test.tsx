import { fireEvent, screen } from "@tests";

import { onSelect, setup } from "./mocks/index.mocks";

beforeEach(() => jest.clearAllMocks());

it("SHOULD expose one item per group with income and expenses AND select it", () => {
  setup();
  expect(screen.getByLabelText("Dec, R$ 700, R$ 400")).toBeTruthy();
  fireEvent.press(screen.getByTestId("columns-group-0"));
  expect(onSelect).toHaveBeenCalledWith(0);
});

it("SHOULD draw empty and all-zero data without NaN", () => {
  setup({ groups: [] });
  setup({
    groups: [
      {
        expense: { projected: 0, realized: 0 },
        income: { projected: 0, realized: 0 },
        label: "Nov",
      },
    ],
    selectedIndex: 0,
  });
  expect(JSON.stringify(screen.toJSON())).not.toContain("NaN");
});

it("SHOULD draw the Today marker only WHEN asked (spec 053)", () => {
  setup();
  expect(screen.queryByTestId("columns-today")).toBeNull();
  setup({ today: { index: 0, label: "Today" } });
  expect(screen.getByTestId("columns-today")).toBeTruthy();
});
