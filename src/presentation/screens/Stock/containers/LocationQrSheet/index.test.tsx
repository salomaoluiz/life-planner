import { fireEvent, render, screen } from "@tests";

import { printHtml } from "@infrastructure/print";
import { shareText } from "@infrastructure/share";

import LocationQrSheet from "./index";

jest.mock("@infrastructure/print", () => ({ printHtml: jest.fn() }));
jest.mock("@infrastructure/share", () => ({ shareText: jest.fn() }));
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

const location = { id: "loc-1", name: "Despensa" };

beforeEach(() => {
  jest.clearAllMocks();
  process.env.EXPO_PUBLIC_PROJECT_WEBSITE_URL = "https://app.example.com";
});

it("SHOULD show the QR of the location link AND share the link", () => {
  render(<LocationQrSheet location={location} onClose={jest.fn()} />);

  expect(screen.getByTestId("stock.location.qr.code")).toBeTruthy();

  fireEvent.press(screen.getByTestId("stock.location.qr.share"));

  expect(shareText).toHaveBeenCalledWith(
    expect.stringContaining("https://app.example.com/stock/locations/loc-1"),
  );
});

it("SHOULD print an A6 page with the location name", () => {
  render(<LocationQrSheet location={location} onClose={jest.fn()} />);

  fireEvent.press(screen.getByTestId("stock.location.qr.print"));

  expect(printHtml).toHaveBeenCalledWith(expect.stringContaining("Despensa"));
});
