import { fireEvent, screen } from "@tests";

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
