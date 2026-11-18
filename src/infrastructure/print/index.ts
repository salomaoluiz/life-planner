import * as Print from "expo-print";
import { Platform } from "react-native";

const REMOVE_AFTER_MS = 1000;

// Prints an HTML page: the native print dialog through expo-print, `window.print` on the web (spec 117 FR 19).
async function printHtml(html: string): Promise<void> {
  if (Platform.OS !== "web") {
    await Print.printAsync({ html });

    return;
  }

  const frame = document.createElement("iframe");

  frame.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  frame.onload = () => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    setTimeout(() => frame.remove(), REMOVE_AFTER_MS);
  };
  frame.srcdoc = html;
  document.body.appendChild(frame);
}

export { printHtml };
