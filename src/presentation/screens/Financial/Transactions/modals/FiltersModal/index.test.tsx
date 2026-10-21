import { EMPTY_FILTERS } from "@screens/Financial/Transactions/models/transactionFilters";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import { fireEvent, params, screen, setup } from "./mocks/index.mocks";

const ids = transactionsTestIds;

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

    fireEvent.press(screen.getByTestId(`${ids.filtersCategory}-market`));
    fireEvent.press(screen.getByTestId(`${ids.filtersCancel}`));
    expect(params.onApply).not.toHaveBeenCalled();
    expect(params.onClose).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByTestId(ids.filtersApply));
    expect(params.onApply).toHaveBeenCalledWith({
      ...EMPTY_FILTERS,
      categoryIds: ["market"],
    });
  });

  it("SHOULD show the children of a chosen parent as checked and a partly chosen parent as mixed", () => {
    setup();

    fireEvent.press(screen.getByTestId(`${ids.filtersCategory}-greens`));
    expect(
      screen.getByTestId(`${ids.filtersCategory}-market`).props
        .accessibilityState.checked,
    ).toBe("mixed");

    fireEvent.press(screen.getByTestId(`${ids.filtersCategory}-market`));
    expect(
      screen.getByTestId(`${ids.filtersCategory}-butcher`).props
        .accessibilityState.checked,
    ).toBe(true);
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
  it("SHOULD show picker rows instead of the lists, and open the category step", () => {
    setup({}, "compact");

    expect(screen.queryByTestId(`${ids.filtersCategory}-market`)).toBeNull();
    fireEvent.press(screen.getByTestId(`${ids.filtersSection}.categories`));

    expect(
      screen.getByTestId(`${ids.filtersCategory}-market`),
    ).toBeOnTheScreen();
    expect(screen.getByTestId(ids.filtersDone)).toBeOnTheScreen();
    expect(
      screen.getByText("financial.transactions.filters.back"),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId(ids.filtersBack));
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
