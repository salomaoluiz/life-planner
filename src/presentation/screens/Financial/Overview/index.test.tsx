import { fireEvent, screen, within } from "@tests";

import { query, setup, vmStub } from "./mocks/screen.mocks";
import overviewTestIds from "./testIds";

beforeEach(() => jest.clearAllMocks());

it("SHOULD render the four tiles AND the blocks", () => {
  setup();

  ["balance", "income", "expense", "result"].forEach((name) =>
    expect(screen.getByTestId(overviewTestIds.tile(name))).toBeOnTheScreen(),
  );
  expect(screen.getByTestId(overviewTestIds.balanceChart)).toBeOnTheScreen();
  expect(
    screen.getByTestId(overviewTestIds.incomeExpenseChart),
  ).toBeOnTheScreen();
  expect(screen.getByTestId(overviewTestIds.categories)).toBeOnTheScreen();
  expect(screen.getByTestId(overviewTestIds.tags)).toBeOnTheScreen();
});

it("SHOULD show the result of the period AND the hint of the disabled granularity", () => {
  setup();

  expect(
    screen.getByTestId(`${overviewTestIds.tile("result")}-value`).props
      .children,
  ).toMatch(/5[.,]00/);
  expect(
    screen.getByText("financial.overview.granularity.dayHint"),
  ).toBeOnTheScreen();
});

it("SHOULD open a category and a tag", () => {
  setup();

  fireEvent.press(screen.getByTestId("financial.overview.category-row-food"));
  expect(vmStub.onCategoryPress).toHaveBeenCalledWith("food", "Food", false, {
    percent: "100%",
    value: 300,
  });
  fireEvent.press(screen.getByTestId("financial.overview.tag-row-t1"));
  expect(vmStub.onTagPress).toHaveBeenCalledWith("t1");
});

it("SHOULD show only the failing block's retry while the others render", () => {
  const failing = query(undefined, "error");

  setup({ categoryTotals: failing });

  expect(screen.getByText("financial.overview.blockError")).toBeOnTheScreen();
  fireEvent.press(screen.getByText("financial.overview.retry"));
  expect(failing.refetch).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId(overviewTestIds.tags)).toBeOnTheScreen();
  expect(screen.getByTestId(overviewTestIds.tile("balance"))).toBeOnTheScreen();
});

it("SHOULD replace the charts by the empty state AND keep the tiles", () => {
  setup({ noTransactions: true });

  expect(screen.getByTestId(overviewTestIds.empty)).toBeOnTheScreen();
  expect(screen.queryByTestId(overviewTestIds.balanceChart)).toBeNull();
  expect(screen.getByTestId(overviewTestIds.tile("balance"))).toBeOnTheScreen();
  fireEvent.press(screen.getByText("financial.overview.empty.newTransaction"));
  expect(vmStub.onNewTransaction).toHaveBeenCalledTimes(1);
});

it("SHOULD show skeleton tiles while the summary loads", () => {
  setup({ summary: query(undefined, "pending") });

  expect(
    screen.getByTestId(`${overviewTestIds.tile("balance")}-loading`),
  ).toBeOnTheScreen();
});

it("SHOULD show the currency selector only with more than one currency", () => {
  setup();
  expect(screen.queryByTestId(overviewTestIds.currency)).toBeNull();
  setup({
    currencies: [
      { accounts: 1, cards: 0, code: "BRL" },
      { accounts: 1, cards: 0, code: "USD" },
    ],
  });
  expect(screen.getByTestId(overviewTestIds.currency)).toBeOnTheScreen();
});

it("SHOULD lay the blocks out on a compact screen too", () => {
  setup({}, "compact");

  expect(screen.getByTestId(overviewTestIds.categories)).toBeOnTheScreen();
});

it("SHOULD show the subcategories header with back AND the link to Transactions", () => {
  setup({
    parent: { id: "housing", name: "Housing", percent: "30%", value: 300 },
  });

  fireEvent.press(screen.getByTestId(overviewTestIds.categoriesBack));
  expect(vmStub.onBack).toHaveBeenCalledTimes(1);
  fireEvent.press(
    screen.getByTestId(overviewTestIds.categoriesOpenTransactions),
  );
  expect(vmStub.onOpenParentTransactions).toHaveBeenCalledTimes(1);
});

it("SHOULD open the filters modal WITHOUT the period section AND the custom period sheet", () => {
  setup({ customOpen: true, filtersOpen: true });

  expect(
    screen.queryByTestId("financial.transactions.filters-section.period"),
  ).toBeNull();
  expect(
    screen.getByTestId("financial.overview.custom-sheet"),
  ).toBeOnTheScreen();
});

it("SHOULD show the monthly average of every category and tag row WHEN the period spans months", () => {
  setup();

  expect(
    screen.getByTestId("financial.overview.category-row-food-average"),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId("financial.overview.tag-row-t1-average"),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId("financial.overview.tag-row-untagged-average"),
  ).toBeOnTheScreen();
  expect(screen.getAllByText("financial.overview.legend.total")).toHaveLength(
    2,
  );
});

it("SHOULD show the average as a second line on mobile instead of a column", () => {
  setup({}, "compact");

  expect(
    screen.getByTestId("financial.overview.category-row-food-average").props
      .children,
  ).toContain("financial.overview.legend.average");
  expect(screen.queryByText("financial.overview.legend.total")).toBeNull();
});

it("SHOULD show no average WHEN the period touches a single month", () => {
  setup({ period: { from: "2026-10-01", to: "2026-10-31" } });

  expect(
    screen.queryByTestId("financial.overview.category-row-food-average"),
  ).toBeNull();
  expect(
    screen.queryByTestId("financial.overview.tag-row-t1-average"),
  ).toBeNull();
});

describe("future periods (spec 053)", () => {
  const withProjected = query({
    balance: { current: 6000, previous: 5000, projectedEnd: 7500 },
    currencies: [],
    currency: "BRL",
    expense: { previous: 200, projected: 100, realized: 400 },
    income: { previous: 0, projected: 50, realized: 900 },
  });

  it("SHOULD show the projected end balance AND the incl. projected note on the other tiles", () => {
    setup({ summary: withProjected });

    expect(
      screen.getByTestId(overviewTestIds.balanceProjectedEnd).props.children,
    ).toContain("financial.overview.balance.projectedEnd");
    expect(
      screen.getByTestId(overviewTestIds.balanceProjectedEnd).props.children,
    ).toMatch(/75[.,]00/);
    expect(
      screen.getByTestId(overviewTestIds.tile("income")).props
        .accessibilityLabel,
    ).toContain("financial.overview.delta.inclProjected");
    expect(
      screen.getByTestId(overviewTestIds.tile("balance")).props
        .accessibilityLabel,
    ).toContain("financial.overview.tiles.vsPrevious");
  });

  it("SHOULD show neither the second line nor the incl. projected note WHEN nothing is projected", () => {
    setup();

    expect(
      screen.queryByTestId(overviewTestIds.balanceProjectedEnd),
    ).toBeNull();
    expect(
      screen.getByTestId(overviewTestIds.tile("income")).props
        .accessibilityLabel,
    ).toContain("financial.overview.tiles.vsPrevious");
  });

  it("SHOULD draw the Today marker in both charts WHEN today is inside the period", () => {
    setup();

    expect(
      screen.getByTestId("financial.overview.balance-line-today"),
    ).toBeOnTheScreen();
  });

  it("SHOULD not draw the Today marker WHEN the period is entirely in the past", () => {
    setup({ today: "2027-03-01" });

    expect(
      screen.queryByTestId("financial.overview.balance-line-today"),
    ).toBeNull();
    expect(
      screen.queryByTestId("financial.overview.income-expense-columns-today"),
    ).toBeNull();
  });
});

it("SHOULD list income, expense and result one per line for the focused month", () => {
  setup({ selectedGroup: 0 });

  const id = overviewTestIds.incomeExpenseDetail;

  ["income", "expense", "result"].forEach((row) =>
    expect(screen.getByTestId(`${id}-${row}`)).toBeOnTheScreen(),
  );
  expect(screen.getByTestId(`${id}-result`).props.children).toMatch(/5[.,]00/);
});

it("SHOULD reopen the custom period WHEN Custom is pressed while selected", () => {
  setup({ preset: "CUSTOM" });

  fireEvent.press(screen.getByTestId("financial.overview.period-CUSTOM"));
  expect(vmStub.onPresetReselect).toHaveBeenCalledWith("CUSTOM");
  expect(vmStub.onPresetChange).not.toHaveBeenCalled();
});

describe("favorite account on the balance chart (spec 094)", () => {
  const favorite = {
    currency: "BRL",
    id: "a",
    isFavorite: true,
    name: "Checking",
  };
  const twoAccounts = query({
    currency: "BRL",
    granularity: "MONTH",
    points: [
      {
        accounts: [
          { balance: 5000, id: "a", name: "Checking" },
          { balance: 2000, id: "b", name: "Savings" },
        ],
        balance: 7000,
        end: "2026-09-30",
        projected: false,
        start: "2026-09-01",
      },
      {
        accounts: [{ balance: 6000, id: "b", name: "Savings" }],
        balance: 6000,
        end: "2026-10-31",
        projected: true,
        start: "2026-10-01",
      },
    ],
  });

  it("SHOULD draw the favorite on top of a muted total AND explain both in the legend", () => {
    setup({ balance: twoAccounts, favorite, selectedPoint: 0 });

    expect(
      screen.getByTestId("financial.overview.balance-line-series-0"),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId("financial.overview.balance-line-series-1"),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(
        'financial.overview.balance.favoriteLegend {"name":"Checking"}',
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getAllByText("financial.overview.balance.totalLegend").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText("financial.overview.balance.projected"),
    ).toBeOnTheScreen();
  });

  it("SHOULD name both series for screen readers", () => {
    setup({ balance: twoAccounts, favorite, selectedPoint: 0 });

    expect(
      screen.getByTestId("financial.overview.balance-line").props
        .accessibilityLabel,
    ).toContain("financial.overview.a11y.balanceChartFavorite");
  });

  it("SHOULD list the favorite first and highlighted, then the total, then the other accounts", () => {
    setup({ balance: twoAccounts, favorite, selectedPoint: 0 });

    expect(
      screen.getByTestId(overviewTestIds.balanceFavoriteRow),
    ).toBeOnTheScreen();
    expect(
      screen.getByText("financial.overview.balance.favoriteCaption"),
    ).toBeOnTheScreen();
    expect(
      within(screen.getByTestId(overviewTestIds.balanceDetail)).getByText(
        "financial.overview.balance.totalLegend",
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(overviewTestIds.balanceOtherAccounts),
    ).toBeOnTheScreen();
    expect(screen.getAllByText("Savings")).toHaveLength(1);
  });

  it("SHOULD start the favorite line late WHEN the account has no value in a bucket (no NaN)", () => {
    setup({ balance: twoAccounts, favorite: { ...favorite, id: "b" } });

    expect(JSON.stringify(screen.toJSON())).not.toContain("NaN");
  });

  it("SHOULD look as before WHEN there is no favorite", () => {
    setup({ balance: twoAccounts, selectedPoint: 0 });

    expect(
      screen.queryByTestId("financial.overview.balance-line-series-1"),
    ).toBeNull();
    expect(screen.queryByTestId(overviewTestIds.balanceFavoriteRow)).toBeNull();
    expect(
      screen.getByText("financial.overview.balance.total"),
    ).toBeOnTheScreen();
    expect(screen.getAllByText("Savings")).toHaveLength(1);
    expect(screen.getAllByText("Checking")).toHaveLength(1);
  });
});
