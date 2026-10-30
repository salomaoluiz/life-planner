import Constants from "expo-constants";
import { Platform } from "react-native";

interface AppInfo {
  builtAt: null | string;
  platform: AppPlatform;
  version: string;
}

type AppPlatform = "android" | "ios" | "web";

interface ServedWebVersion {
  builtAt: string;
  version: string;
}

// The `version.json` the web image serves next to the bundle (no-store). A missing file, an HTML
// fallback of the SPA or a broken body all mean "unknown", never "a new version".
async function fetchServedWebVersion(): Promise<null | ServedWebVersion> {
  if (Platform.OS !== "web") {
    return null;
  }

  try {
    const response = await fetch("/version.json", { cache: "no-store" });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as Record<string, unknown>;

    return typeof json.version === "string" && typeof json.builtAt === "string"
      ? { builtAt: json.builtAt, version: json.version }
      : null;
  } catch {
    return null;
  }
}

function getAppInfo(): AppInfo {
  const config = Constants.expoConfig;
  const builtAt = config?.extra?.builtAt;
  const platform: AppPlatform =
    Platform.OS === "web" || Platform.OS === "ios" ? Platform.OS : "android";

  return {
    builtAt: typeof builtAt === "string" ? builtAt : null,
    platform,
    version: config?.version ?? "0.0.0",
  };
}

function reloadApp(): void {
  if (Platform.OS === "web") {
    window.location.reload();
  }
}

export { fetchServedWebVersion, getAppInfo, reloadApp };
export type { AppInfo, AppPlatform, ServedWebVersion };
