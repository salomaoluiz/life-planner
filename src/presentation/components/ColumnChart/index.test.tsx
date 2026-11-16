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

describe("income only (spec 110)", () => {
  const withBigExpense = [
    {
      expense: { projected: 0, realized: 9000 },
      income: { projected: 300, realized: 900 },
      label: "Nov",
    },
    {
      expense: { projected: 0, realized: 9000 },
      income: { projected: 0, realized: 500 },
      label: "Dec",
    },
  ];

  it("SHOULD label a group with its income only", () => {
    setup({ groups: withBigExpense, incomeOnly: true });

    expect(screen.getByLabelText("Nov, R$ 1200")).toBeTruthy();
    expect(screen.queryByLabelText("Nov, R$ 1200, R$ 9000")).toBeNull();
  });

  it("SHOULD scale the axis to the income, ignoring the expense", () => {
    setup({ groups: withBigExpense, incomeOnly: true });

    const ticks = screen.UNSAFE_root.findAll(
      (node) => node.props.textAnchor === "end",
    ).map((node) => Number(node.props.children));

    expect(Math.max(...ticks)).toBeLessThan(9000);
  });

  it("SHOULD draw the projected part dashed AND center a single column per group", () => {
    setup({ groups: withBigExpense, incomeOnly: true });

    const dashed = screen.UNSAFE_root.findAll(
      (node) => node.props.strokeDasharray === "4 3" && node.props.height > 0,
    );

    expect(dashed.length).toBeGreaterThan(0);
  });

  it("SHOULD keep the two columns AND the plain projected part WHEN not income only", () => {
    setup({ groups: withBigExpense });

    expect(
      screen.UNSAFE_root.findAll(
        (node) => node.props.strokeDasharray === "4 3",
      ),
    ).toHaveLength(0);
    expect(screen.getByLabelText("Nov, R$ 1200, R$ 9000")).toBeTruthy();
  });
});
