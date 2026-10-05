import { Platform, Share } from "react-native";

function isShareAvailable(): boolean {
  if (Platform.OS !== "web") {
    return true;
  }

  return (
    typeof navigator !== "undefined" && typeof navigator.share === "function"
  );
}

async function shareText(text: string): Promise<void> {
  try {
    await Share.share({ message: text });
  } catch (error) {
    // Web: dismissing the share sheet rejects with AbortError; that is not a failure.
    if (error instanceof Error && error.name === "AbortError") {
      return;
    }

    throw error;
  }
}

export { isShareAvailable, shareText };
