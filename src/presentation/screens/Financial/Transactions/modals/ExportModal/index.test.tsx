import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import {
  exportMutation,
  fireEvent,
  params,
  screen,
  setupView,
} from "./mocks/index.mocks";

const ids = transactionsTestIds;

describe("wide layout", () => {
  it("SHOULD show the period, owner, accounts, format, count and the footer actions", () => {
    setupView(1284);

    [
      ids.exportFrom,
      ids.exportTo,
      `${ids.exportPreset}-THIS_YEAR`,
      `${ids.exportOwner}-ALL`,
      ids.exportSources,
      `${ids.exportFormat}-BR`,
      ids.exportCount,
      ids.exportSubmit,
      ids.exportCancel,
    ].forEach((id) => expect(screen.getByTestId(id)).toBeOnTheScreen());
    expect(screen.getByText(/financial\.export\.count/)).toBeOnTheScreen();
    expect(screen.getByText("1284")).toBeOnTheScreen();
  });

  it("SHOULD start the export on the primary button and cancel on Cancel", () => {
    setupView(10);

    fireEvent.press(screen.getByTestId(ids.exportSubmit));
    expect(exportMutation.value.mutate).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByTestId(ids.exportCancel));
    expect(params.onClose).toHaveBeenCalledTimes(1);
  });

  it("SHOULD say there is nothing to export and disable the button for a count of 0", () => {
    setupView(0);

    expect(screen.getByText("financial.export.countNone")).toBeOnTheScreen();
    expect(screen.getByTestId(ids.exportSubmit)).toBeDisabled();
  });

  it("SHOULD show a placeholder while the count loads", () => {
    setupView(undefined);

    expect(screen.getByText("financial.export.counting")).toBeOnTheScreen();
    expect(screen.getByTestId(ids.exportSubmit)).toBeDisabled();
  });

  it("SHOULD list the accounts and cards once the picker is open, archived last", () => {
    setupView(5);

    expect(screen.queryByTestId(`${ids.exportSource}-acc-1`)).toBeNull();
    fireEvent.press(screen.getByTestId(ids.exportSources));

    expect(screen.getByTestId(`${ids.exportSource}-acc-1`)).toBeOnTheScreen();
    expect(screen.getByTestId(`${ids.exportSource}-card-1`)).toBeOnTheScreen();
    expect(
      screen.getByText("financial.export.sources.archived"),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId(`${ids.exportSource}-acc-1`));
    expect(
      screen.getByText(/financial\.export\.sources\.selected/),
    ).toBeOnTheScreen();
  });

  it("SHOULD choose a preset and the format", () => {
    setupView(5);

    fireEvent.press(screen.getByTestId(`${ids.exportPreset}-THIS_MONTH`));
    fireEvent.press(screen.getByTestId(`${ids.exportFormat}-BR`));

    expect(
      screen.getByTestId(`${ids.exportFormat}-BR`).props.accessibilityState
        .selected,
    ).toBe(true);
  });

  it("SHOULD offer Download on web and share on mobile", () => {
    setupView(5);

    expect(
      screen.getByText(/financial.export.(download|share)/),
    ).toBeOnTheScreen();
  });
});

describe("compact layout", () => {
  it("SHOULD be a single sheet without the Cancel button", () => {
    setupView(5, "compact");

    expect(screen.getByTestId(ids.exportSubmit)).toBeOnTheScreen();
    expect(screen.queryByTestId(ids.exportCancel)).toBeNull();
  });
});
