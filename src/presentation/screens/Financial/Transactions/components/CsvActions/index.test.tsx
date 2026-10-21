import { fireEvent, render, screen } from "@tests";

import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import CsvActions from "./index";

const props = {
  closeLabel: "Close",
  exportLabel: "Export CSV",
  importLabel: "Import CSV",
  menuLabel: "CSV actions",
  menuOpen: false,
  onExport: jest.fn(),
  onImport: jest.fn(),
  onMenuClose: jest.fn(),
  onMenuOpen: jest.fn(),
  wide: true,
};

beforeEach(() => jest.clearAllMocks());

describe("wide", () => {
  it("SHOULD show Import CSV and Export CSV as buttons", () => {
    render(<CsvActions {...props} />);

    fireEvent.press(screen.getByTestId(transactionsTestIds.importButton));
    fireEvent.press(screen.getByTestId(transactionsTestIds.exportButton));

    expect(props.onImport).toHaveBeenCalledTimes(1);
    expect(props.onExport).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId(transactionsTestIds.moreActions)).toBeNull();
  });
});

describe("compact", () => {
  it("SHOULD open the overflow menu from the icon button", () => {
    render(<CsvActions {...props} wide={false} />);

    fireEvent.press(screen.getByTestId(transactionsTestIds.moreActions));

    expect(props.onMenuOpen).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId(transactionsTestIds.importButton)).toBeNull();
  });

  it("SHOULD list the two actions as the items of the open menu", () => {
    render(<CsvActions {...props} menuOpen wide={false} />);

    fireEvent.press(screen.getByTestId(transactionsTestIds.importButton));
    fireEvent.press(screen.getByTestId(transactionsTestIds.exportButton));

    expect(props.onImport).toHaveBeenCalledTimes(1);
    expect(props.onExport).toHaveBeenCalledTimes(1);
  });
});
