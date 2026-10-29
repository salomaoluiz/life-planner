import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import {
  fireEvent,
  handlers,
  result,
  screen,
  setup,
} from "./mocks/index.mocks";

const ids = transactionsTestIds;
const search = `${ids.filtersSection}.categories-search`;

it("SHOULD list nothing for an empty query but keep the chips", () => {
  setup({ chips: [{ color: "#112233", id: "food", label: "Food" }] });

  expect(screen.queryByTestId(`${ids.filtersCategory}-food`)).toBeNull();
  expect(
    screen.queryByText("financial.transactions.filters.categories.noResults"),
  ).toBeNull();
  expect(screen.getByText("Food")).toBeOnTheScreen();
});

it("SHOULD show bullet row details: name, path, includes count, type and archived badges", () => {
  setup({
    query: "mark",
    results: [result("food"), result("market"), result("old")],
  });

  expect(screen.getByText("Food › Market")).toBeOnTheScreen();
  expect(
    screen.getByText(
      `financial.transactions.filters.categories.includes {"count":1}`,
    ),
  ).toBeOnTheScreen();
  expect(
    screen.getAllByText(
      "financial.transactions.filters.categories.typeExpense",
    ),
  ).toHaveLength(2);
  expect(
    screen.getByText("financial.transactions.filters.categories.archivedBadge"),
  ).toBeOnTheScreen();
});

it("SHOULD pick a result on press", () => {
  setup({ query: "mark", results: [result("market")] });

  fireEvent.press(screen.getByTestId(`${ids.filtersCategory}-market`));
  expect(handlers.onPick).toHaveBeenCalledWith("market");
});

it("SHOULD show a covered result as included and not pick it", () => {
  setup({ query: "mark", results: [result("market", "Food")] });

  expect(
    screen.getByText(
      `financial.transactions.filters.categories.includedIn {"name":"Food"}`,
    ),
  ).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId(`${ids.filtersCategory}-market`));
  expect(handlers.onPick).not.toHaveBeenCalled();
});

it("SHOULD say when nothing matches", () => {
  setup({ query: "zzz", results: [] });

  expect(
    screen.getByText("financial.transactions.filters.categories.noResults"),
  ).toBeOnTheScreen();
});

it("SHOULD remove a chip by id, even when two chips share a label", () => {
  setup({
    chips: [
      { color: "#112233", id: "a", label: "Misc" },
      { id: "b", label: "Misc" },
    ],
  });

  expect(
    screen.getByTestId(`${ids.filtersCategoryChip}-a-dot`, {
      includeHiddenElements: true,
    }),
  ).toHaveStyle({ backgroundColor: "#112233" });
  fireEvent.press(screen.getByTestId(`${ids.filtersCategoryChip}-b-remove`));
  expect(handlers.onRemove).toHaveBeenCalledWith("b");
  expect(screen.getAllByText("Misc")).toHaveLength(2);
});

it("SHOULD hide results on Escape and pick the highlighted one with the arrows and Enter", () => {
  setup({
    query: "mark",
    results: [result("market"), result("old")],
  });
  const input = screen.getByTestId(search);

  fireEvent(input, "keyPress", { nativeEvent: { key: "ArrowDown" } });
  fireEvent(input, "keyPress", { nativeEvent: { key: "ArrowDown" } });
  fireEvent(input, "submitEditing");
  expect(handlers.onPick).toHaveBeenCalledWith("old");

  fireEvent(input, "keyPress", { nativeEvent: { key: "Escape" } });
  expect(screen.queryByTestId(`${ids.filtersCategory}-market`)).toBeNull();
});
