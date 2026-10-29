import { EMPTY_FILTERS } from "@screens/Financial/Transactions/models/transactionFilters";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import { fireEvent, params, screen, setup } from "./mocks/index.mocks";

const ids = transactionsTestIds;
const K = "financial.transactions.filters.";
const search = `${ids.filtersSection}.categories-search`;

function pickCategory(query: string, id: string) {
  fireEvent.changeText(screen.getByTestId(search), query);
  fireEvent.press(screen.getByTestId(`${ids.filtersCategory}-${id}`));
}

describe("wide layout", () => {
  it("SHOULD show every section and the three footer actions", () => {
    setup();

    ["period", "origin", "sources", "situation", "categories", "tags"].forEach(
      (section) =>
        expect(
          screen.getByTestId(`${ids.filtersSection}.${section}`),
        ).toBeOnTheScreen(),
    );
    expect(screen.getByTestId(ids.filtersApply)).toBeOnTheScreen();
    expect(screen.getByTestId(ids.filtersCancel)).toBeOnTheScreen();
    expect(screen.getByTestId(ids.filtersClear)).toBeOnTheScreen();
  });

  it("SHOULD apply the draft and close, but discard it on Cancel", () => {
    setup();

    pickCategory("mark", "market");
    fireEvent.press(screen.getByTestId(`${ids.filtersCancel}`));
    expect(params.onApply).not.toHaveBeenCalled();
    expect(params.onClose).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByTestId(ids.filtersApply));
    expect(params.onApply).toHaveBeenCalledWith({
      ...EMPTY_FILTERS,
      categoryIds: ["market"],
    });
  });

  it("SHOULD list no category before typing and add a chip when one is picked", () => {
    setup();

    expect(screen.queryByTestId(`${ids.filtersCategory}-market`)).toBeNull();
    pickCategory("mark", "market");

    expect(
      screen.getByTestId(`${ids.filtersCategoryChip}-market`),
    ).toBeOnTheScreen();
    expect(screen.getByTestId(search).props.value).toBe("");
    expect(screen.queryByTestId(`${ids.filtersCategory}-market`)).toBeNull();
  });

  it("SHOULD show a child of a chosen parent as included and disabled", () => {
    setup({ filters: { ...EMPTY_FILTERS, categoryIds: ["market"] } });

    fireEvent.changeText(screen.getByTestId(search), "gree");
    fireEvent.press(screen.getByTestId(`${ids.filtersCategory}-greens`));
    fireEvent.press(screen.getByTestId(ids.filtersApply));

    expect(
      screen.getByText(`${K}categories.includedIn {"name":"Market"}`),
    ).toBeOnTheScreen();
    expect(params.onApply).toHaveBeenCalledWith({
      ...EMPTY_FILTERS,
      categoryIds: ["market"],
    });
  });

  it("SHOULD swap the children for the parent when the parent is picked, and remove through the chip", () => {
    setup({ filters: { ...EMPTY_FILTERS, categoryIds: ["greens"] } });

    pickCategory("mark", "market");
    expect(
      screen.queryByTestId(`${ids.filtersCategoryChip}-greens`),
    ).toBeNull();
    fireEvent.press(
      screen.getByTestId(`${ids.filtersCategoryChip}-market-remove`),
    );
    fireEvent.press(screen.getByTestId(ids.filtersApply));

    expect(params.onApply).toHaveBeenCalledWith(EMPTY_FILTERS);
  });

  it("SHOULD find an archived category only by search and mark it", () => {
    setup();

    expect(screen.queryByTestId(`${ids.filtersCategory}-gym`)).toBeNull();
    fireEvent.changeText(screen.getByTestId(search), "gym");

    expect(screen.getByTestId(`${ids.filtersCategory}-gym`)).toBeOnTheScreen();
    expect(screen.getByText(`${K}categories.archivedBadge`)).toBeOnTheScreen();
  });

  it("SHOULD list the type of the screen first", () => {
    setup({ typeFirst: "INCOME" });

    fireEvent.changeText(screen.getByTestId(search), "sal");

    expect(
      screen.getAllByTestId(new RegExp(`^${ids.filtersCategory}-`))[0].props
        .testID,
    ).toBe(`${ids.filtersCategory}-salary`);
  });

  it("SHOULD not list archived accounts, but keep one that is in the applied filter", () => {
    setup();

    expect(screen.getByTestId(`${ids.filtersSource}-acc-1`)).toBeOnTheScreen();
    expect(screen.queryByTestId(`${ids.filtersSource}-acc-old`)).toBeNull();
    expect(screen.getByText(`${K}sources.archivedHidden`)).toBeOnTheScreen();
  });

  it("SHOULD list an archived account already in the filter, checked, and let it be unchecked", () => {
    setup({ filters: { ...EMPTY_FILTERS, accountIds: ["acc-old"] } });

    const row = screen.getByTestId(`${ids.filtersSource}-acc-old`);

    expect(row.props.accessibilityState.checked).toBe(true);
    fireEvent.press(row);
    fireEvent.press(screen.getByTestId(ids.filtersApply));
    expect(params.onApply).toHaveBeenCalledWith(EMPTY_FILTERS);
  });

  it("SHOULD list only accounts for origin Account and clear the chosen cards", () => {
    setup({ filters: { ...EMPTY_FILTERS, cardIds: ["card-1"] } });

    fireEvent.press(
      screen.getByTestId(`${ids.filtersSection}.origin-option-ACCOUNT`),
    );

    expect(screen.queryByTestId(`${ids.filtersSource}-card-1`)).toBeNull();
    expect(screen.getByTestId(`${ids.filtersSource}-acc-1`)).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId(ids.filtersApply));
    expect(params.onApply).toHaveBeenCalledWith(
      expect.objectContaining({ cardIds: [], origin: "ACCOUNT" }),
    );
  });

  it("SHOULD choose a preset and apply its period", () => {
    setup();

    fireEvent.press(
      screen.getByTestId(`${ids.filtersSection}.period-mode-THIS_YEAR`),
    );
    fireEvent.press(screen.getByTestId(ids.filtersApply));

    const year = new Date().getFullYear();

    expect(params.onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        period: { from: `${year}-01-01`, to: `${year}-12-31` },
      }),
    );
  });

  it("SHOULD refuse a period over two years: error with the last valid day and no apply", () => {
    setup({
      filters: {
        ...EMPTY_FILTERS,
        period: { from: "2024-01-01", to: "2026-03-15" },
      },
    });

    expect(screen.getByTestId(ids.filtersPeriodError)).toBeOnTheScreen();
    expect(
      screen.getByTestId(ids.filtersApply).props.accessibilityState,
    ).toEqual(expect.objectContaining({ disabled: true }));
  });

  it("SHOULD clear the draft with Clear all", () => {
    setup({
      filters: { ...EMPTY_FILTERS, categoryIds: ["market"], situation: "PAID" },
    });

    fireEvent.press(screen.getByTestId(ids.filtersClear));
    fireEvent.press(screen.getByTestId(ids.filtersApply));

    expect(params.onApply).toHaveBeenCalledWith(EMPTY_FILTERS);
  });
});

describe("compact layout", () => {
  it("SHOULD keep Categories in the root sheet with search, and no category step", () => {
    setup({}, "compact");

    expect(screen.getByTestId(search)).toBeOnTheScreen();
    pickCategory("mark", "market");
    expect(
      screen.getByTestId(`${ids.filtersCategoryChip}-market`),
    ).toBeOnTheScreen();
    expect(screen.getByTestId(ids.filtersApply)).toBeOnTheScreen();
  });

  it("SHOULD open the period and sources steps", () => {
    setup({}, "compact");

    fireEvent.press(screen.getByTestId(`${ids.filtersSection}.period`));
    expect(
      screen.getByTestId(`${ids.filtersSection}.period-mode-NONE`),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId(ids.filtersDone));

    fireEvent.press(screen.getByTestId(`${ids.filtersSection}.sources`));
    expect(screen.getByTestId(`${ids.filtersSource}-acc-1`)).toBeOnTheScreen();
  });
});

describe("hidePeriod (spec 046)", () => {
  it("SHOULD leave the Period section out on wide layouts and keep the others", () => {
    setup({ hidePeriod: true });

    expect(screen.queryByTestId(`${ids.filtersSection}.period`)).toBeNull();
    expect(
      screen.getByTestId(`${ids.filtersSection}.origin`),
    ).toBeOnTheScreen();
  });

  it("SHOULD leave the Period row out on compact layouts", () => {
    setup({ hidePeriod: true }, "compact");

    expect(screen.queryByTestId(`${ids.filtersSection}.period`)).toBeNull();
    expect(
      screen.getByTestId(`${ids.filtersSection}.categories`),
    ).toBeOnTheScreen();
  });
});
