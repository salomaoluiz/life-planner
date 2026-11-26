import { EMPTY_FILTERS } from "@screens/Financial/Transactions/models/transactionFilters";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import { fireEvent, params, screen, setup } from "./mocks/index.mocks";

const ids = transactionsTestIds;
const K = "financial.transactions.filters.";
const field = `${ids.filtersSection}.categories-field`;
const picker = `${field}-picker`;

// Opens the shared tree picker, ticks the categories and applies the picker.
function pickCategories(...categoryIds: string[]) {
  fireEvent.press(screen.getByTestId(`${field}-field`));
  categoryIds.forEach((id) =>
    fireEvent.press(screen.getByTestId(`${picker}-option-${id}`)),
  );
  fireEvent.press(screen.getByTestId(`${picker}-apply`));
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

    pickCategories("market");
    fireEvent.press(screen.getByTestId(`${ids.filtersCancel}`));
    expect(params.onApply).not.toHaveBeenCalled();
    expect(params.onClose).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByTestId(ids.filtersApply));
    expect(params.onApply).toHaveBeenCalledWith({
      ...EMPTY_FILTERS,
      categoryIds: ["market"],
    });
  });

  it("SHOULD add a removable chip when a category is picked", () => {
    setup();

    pickCategories("market");

    expect(screen.getByTestId(`${field}-chip-market`)).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId(`${field}-chip-market-remove`));
    fireEvent.press(screen.getByTestId(ids.filtersApply));
    expect(params.onApply).toHaveBeenCalledWith(EMPTY_FILTERS);
  });

  it("SHOULD show a child of a chosen parent as included and not tickable", () => {
    setup({ filters: { ...EMPTY_FILTERS, categoryIds: ["market"] } });

    fireEvent.press(screen.getByTestId(`${field}-field`));
    expect(
      screen.getAllByText('common.treePicker.includedIn {"name":"Market"}')
        .length,
    ).toBeGreaterThan(0);
    fireEvent.press(screen.getByTestId(`${picker}-option-greens`));
    fireEvent.press(screen.getByTestId(`${picker}-apply`));
    fireEvent.press(screen.getByTestId(ids.filtersApply));

    expect(params.onApply).toHaveBeenCalledWith({
      ...EMPTY_FILTERS,
      categoryIds: ["market"],
    });
  });

  it("SHOULD never list an archived category and badge the type of each one", () => {
    setup();

    fireEvent.press(screen.getByTestId(`${field}-field`));

    expect(screen.queryByTestId(`${picker}-option-gym`)).toBeNull();
    expect(
      screen.getByTestId(`${picker}-option-salary-badge`),
    ).toBeOnTheScreen();
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
  it("SHOULD keep Categories in the root sheet, and no category step", () => {
    setup({}, "compact");

    expect(screen.getByTestId(`${field}-field`)).toBeOnTheScreen();
    pickCategories("market");
    expect(screen.getByTestId(`${field}-chip-market`)).toBeOnTheScreen();
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

describe("transfers kind (spec 098)", () => {
  it("SHOULD show the kind section AND apply transfers only when it is toggled", () => {
    setup();

    expect(screen.getByTestId(`${ids.filtersSection}.kind`)).toBeOnTheScreen();
    fireEvent.press(screen.getByText("financial.transfers.filters.kind"));
    fireEvent.press(screen.getByTestId(ids.filtersApply));

    expect(params.onApply).toHaveBeenCalledWith({
      ...EMPTY_FILTERS,
      transfersOnly: true,
    });
  });
});

describe("currency (spec 103)", () => {
  it("SHOULD NOT offer the currency WHEN the screen has only one", () => {
    setup();

    expect(screen.queryByTestId(ids.currency)).toBeNull();
  });

  it("SHOULD apply the chosen currency with the filters, on wide and compact", () => {
    ["expanded", "compact"].forEach((breakpoint) => {
      const onChange = jest.fn();
      const { unmount } = setup(
        { currency: { onChange, options: ["BRL", "USD"], value: "BRL" } },
        breakpoint as "compact" | "expanded",
      );

      fireEvent.press(screen.getByTestId(ids.currency));
      fireEvent.press(
        screen.getByText("financial.accounts.currencyOption.USD"),
      );
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.press(screen.getByTestId(ids.filtersApply));
      expect(onChange).toHaveBeenCalledWith("USD");
      unmount();
    });
  });

  it("SHOULD NOT report the currency WHEN it did not change", () => {
    const onChange = jest.fn();

    setup({ currency: { onChange, options: ["BRL", "USD"], value: "USD" } });
    fireEvent.press(screen.getByTestId(ids.filtersApply));

    expect(onChange).not.toHaveBeenCalled();
  });
});
