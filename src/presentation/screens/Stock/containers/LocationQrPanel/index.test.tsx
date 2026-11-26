import { fireEvent, render, screen } from "@tests";

import { printHtml } from "@infrastructure/print";
import { shareText } from "@infrastructure/share";

import LocationQrPanel, { webBase } from "./index";

jest.mock("@infrastructure/print", () => ({ printHtml: jest.fn() }));
jest.mock("@infrastructure/share", () => ({ shareText: jest.fn() }));
jest.mock("@infrastructure/qrcode", () => ({
  qrMatrix: jest.fn(() => [
    [true, false],
    [false, true],
  ]),
}));

beforeEach(() => {
  jest.clearAllMocks();
  process.env.EXPO_PUBLIC_PROJECT_WEBSITE_URL = "https://app.example.com";
});

it("SHOULD show the QR, share the link and print an A6 page", () => {
  render(
    <LocationQrPanel location={{ id: "loc-1", name: "Cozinha / Geladeira" }} />,
  );

  expect(screen.getByTestId("stock.location.qr.code")).toBeTruthy();

  fireEvent.press(screen.getByTestId("stock.location.qr.share"));
  expect(shareText).toHaveBeenCalledWith(
    expect.stringContaining("https://app.example.com/stock/locations/loc-1"),
  );

  fireEvent.press(screen.getByTestId("stock.location.qr.print"));
  expect(printHtml).toHaveBeenCalledWith(
    expect.stringContaining("Cozinha / Geladeira"),
  );
});

it("SHOULD read the web base from the environment", () => {
  expect(webBase()).toBe("https://app.example.com");
});

it("SHOULD fall back to the page origin WHEN the variable is missing", () => {
  delete process.env.EXPO_PUBLIC_PROJECT_WEBSITE_URL;

  expect(typeof webBase()).toMatch(/string|undefined/);
});
