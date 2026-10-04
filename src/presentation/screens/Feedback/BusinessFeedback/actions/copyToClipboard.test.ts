import * as Clipboard from "expo-clipboard";

import handleCopyToClipboard from "./copyToClipboard";
import { FeedbackActions } from "./types";

jest.mock("expo-clipboard", () => ({ setStringAsync: jest.fn() }));

it("SHOULD copy the value to the clipboard", async () => {
  await handleCopyToClipboard({
    action: FeedbackActions.COPY_TO_CLIPBOARD,
    value: "https://example.test/invite?token=abc",
  });

  expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
    "https://example.test/invite?token=abc",
  );
});
