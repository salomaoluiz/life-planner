import * as Clipboard from "expo-clipboard";

import { CopyToClipboardAction } from "@screens/Feedback/BusinessFeedback/actions/types";

async function handleCopyToClipboard(props: CopyToClipboardAction) {
  await Clipboard.setStringAsync(props.value);
}

export default handleCopyToClipboard;
