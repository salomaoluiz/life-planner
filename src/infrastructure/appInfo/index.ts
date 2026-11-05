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

const CHUNK_RELOAD_KEY = "life-planner.chunkReloadAt";
const CHUNK_RELOAD_WINDOW_MS = 60 * 1000;

// A lazy route chunk that no longer exists on the server (a deploy replaced it while the tab, or a
// cached parent chunk, still pointed at it) fails with `AsyncRequireError`.
function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === "AsyncRequireError" ||
    error.name === "ChunkLoadError" ||
    /Loading module .* failed/.test(error.message)
  );
}

// Reloads the web page once when a chunk failed to load, so the user gets the new build instead of
// an error screen. At most one reload per minute: a chunk that is really missing must not loop.
function reloadOnStaleChunk(error: unknown): boolean {
  if (Platform.OS !== "web" || !isChunkLoadError(error)) {
    return false;
  }

  try {
    const last = Number(window.sessionStorage.getItem(CHUNK_RELOAD_KEY));

    if (Date.now() - last < CHUNK_RELOAD_WINDOW_MS) {
      return false;
    }

    window.sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }

  reloadApp();

  return true;
}

export {
  fetchServedWebVersion,
  getAppInfo,
  isChunkLoadError,
  reloadApp,
  reloadOnStaleChunk,
};
export type { AppInfo, AppPlatform, ServedWebVersion };
