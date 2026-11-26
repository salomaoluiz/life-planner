import { fireEvent, render, screen } from "@tests";

import { printHtml } from "@infrastructure/print";
import stockCatalogTestIds from "@screens/Stock/Catalog/testIds";

import LocationQrPrintSheet from "./";

jest.mock("@infrastructure/print", () => ({ printHtml: jest.fn() }));
jest.mock("@infrastructure/qrcode", () => ({
  qrMatrix: jest.fn(() => [
    [true, false],
    [false, true],
  ]),
}));
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const locations = [
  { id: "k", path: "Cozinha" },
  { id: "f", path: "Cozinha › Geladeira" },
];

beforeEach(() => {
  jest.clearAllMocks();
  process.env.EXPO_PUBLIC_PROJECT_WEBSITE_URL = "https://app.example.com";
});

it("SHOULD print one page with the locations that stay checked", () => {
  render(<LocationQrPrintSheet locations={locations} onClose={jest.fn()} />);

  fireEvent.press(screen.getByTestId(`${stockCatalogTestIds.printRow}.f`));
  fireEvent.press(screen.getByTestId(stockCatalogTestIds.printConfirm));

  const html = jest.mocked(printHtml).mock.calls[0][0];

  expect(html).toContain("Cozinha");
  expect(html).not.toContain("Geladeira");
  expect(html.match(/class="label"/g)).toHaveLength(1);
});

it("SHOULD check a location again and disable printing WHEN none is checked", () => {
  render(<LocationQrPrintSheet locations={locations} onClose={jest.fn()} />);

  fireEvent.press(screen.getByTestId(`${stockCatalogTestIds.printRow}.f`));
  fireEvent.press(screen.getByTestId(`${stockCatalogTestIds.printRow}.f`));
  fireEvent.press(screen.getByTestId(`${stockCatalogTestIds.printRow}.f`));
  fireEvent.press(screen.getByTestId(`${stockCatalogTestIds.printRow}.k`));

  expect(screen.getByTestId(stockCatalogTestIds.printConfirm)).toBeDisabled();
});

it("SHOULD show the empty message WHEN there are no locations", () => {
  render(<LocationQrPrintSheet locations={[]} onClose={jest.fn()} />);

  expect(screen.getByText("stock.catalog.qrPrint.empty")).toBeOnTheScreen();
});
