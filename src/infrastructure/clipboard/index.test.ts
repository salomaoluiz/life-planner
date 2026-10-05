import * as Clipboard from "expo-clipboard";

import { copyText } from "./";

jest.mock("expo-clipboard", () => ({ setStringAsync: jest.fn() }));

it("SHOULD copy the text to the system clipboard", async () => {
  await copyText("https://example.test/invite?token=abc");

  expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
    "https://example.test/invite?token=abc",
  );
});
