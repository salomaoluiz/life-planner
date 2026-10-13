import * as Clipboard from "expo-clipboard";

async function copyText(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}

export { copyText };
