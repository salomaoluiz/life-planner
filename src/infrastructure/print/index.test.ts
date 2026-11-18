import * as Print from "expo-print";
import { Platform } from "react-native";

import { printHtml } from "./index";

jest.mock("expo-print", () => ({ printAsync: jest.fn() }));

it("SHOULD open the native print dialog with the html on a device", async () => {
  Platform.OS = "ios";

  await printHtml("<p>x</p>");

  expect(Print.printAsync).toHaveBeenCalledWith({ html: "<p>x</p>" });
});

it("SHOULD print from a hidden frame on the web", async () => {
  Platform.OS = "web";

  const print = jest.fn();
  const frame = {
    contentWindow: { focus: jest.fn(), print },
    onload: undefined as (() => void) | undefined,
    remove: jest.fn(),
    srcdoc: "",
    style: { cssText: "" },
  };
  const appendChild = jest.fn();

  Object.assign(globalThis, {
    document: { body: { appendChild }, createElement: () => frame },
  });

  await printHtml("<p>x</p>");
  frame.onload?.();

  expect(frame.srcdoc).toBe("<p>x</p>");
  expect(appendChild).toHaveBeenCalledWith(frame);
  expect(print).toHaveBeenCalled();
});
