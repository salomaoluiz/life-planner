import { fireEvent, render, screen } from "@tests";

import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import CsvActions from "./index";

const props = {
  closeLabel: "Close",
  exportLabel: "Export CSV",
  importLabel: "Import CSV",
  menuLabel: "More actions",
  menuOpen: false,
  onExport: jest.fn(),
  onImport: jest.fn(),
  onMenuClose: jest.fn(),
  onMenuOpen: jest.fn(),
  wide: true,
};

beforeEach(() => jest.clearAllMocks());

describe.each([
  ["wide", true],
  ["compact", false],
])("%s", (_name, wide) => {
  it("SHOULD open the menu from the ⋮ button AND keep the items hidden until then", () => {
    render(<CsvActions {...props} wide={wide} />);

    fireEvent.press(screen.getByTestId(transactionsTestIds.moreActions));

    expect(props.onMenuOpen).toHaveBeenCalledTimes(1);
    // The Paper Menu mock always renders its children; the real one hides them while closed.
    if (!wide) {
      expect(screen.queryByTestId(transactionsTestIds.importButton)).toBeNull();
      expect(screen.queryByTestId(transactionsTestIds.exportButton)).toBeNull();
    }
  });

  it("SHOULD list the two actions as the items of the open menu", () => {
    render(<CsvActions {...props} menuOpen wide={wide} />);

    fireEvent.press(screen.getByTestId(transactionsTestIds.importButton));
    fireEvent.press(screen.getByTestId(transactionsTestIds.exportButton));

    expect(props.onImport).toHaveBeenCalledTimes(1);
    expect(props.onExport).toHaveBeenCalledTimes(1);
  });
});

it("SHOULD open the bottom sheet with the menu title WHEN compact", () => {
  render(<CsvActions {...props} menuOpen wide={false} />);

  expect(
    screen.getByTestId(transactionsTestIds.moreActionsSheet),
  ).toBeOnTheScreen();
  expect(screen.getByText("More actions")).toBeOnTheScreen();
});
