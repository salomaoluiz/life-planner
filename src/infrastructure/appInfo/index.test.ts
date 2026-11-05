import Constants from "expo-constants";
import { Platform } from "react-native";

import {
  fetchServedWebVersion,
  getAppInfo,
  isChunkLoadError,
  reloadApp,
  reloadOnStaleChunk,
} from "./";

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: { extra: {}, version: "1.4.0" } },
}));

const fetchMock = jest.fn();
const reloadMock = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  const store = new Map<string, string>();
  Object.defineProperty(window, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    },
  });
  global.fetch = fetchMock;
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { reload: reloadMock },
  });
  Platform.OS = "web";
  (Constants.expoConfig as { extra: unknown; version: string }).extra = {
    builtAt: "2026-10-28T18:12:00Z",
  };
});

function respond(body: unknown, ok = true) {
  fetchMock.mockResolvedValue({ json: async () => body, ok });
}

describe("getAppInfo", () => {
  it("SHOULD read the version, build time and platform from the app config", () => {
    expect(getAppInfo()).toEqual({
      builtAt: "2026-10-28T18:12:00Z",
      platform: "web",
      version: "1.4.0",
    });
  });

  it("SHOULD report android for non web and non ios platforms AND a null build time WHEN missing", () => {
    Platform.OS = "android";
    (Constants.expoConfig as { extra: unknown }).extra = {};

    expect(getAppInfo()).toMatchObject({ builtAt: null, platform: "android" });
  });

  it("SHOULD report ios", () => {
    Platform.OS = "ios";

    expect(getAppInfo().platform).toBe("ios");
  });
});

describe("fetchServedWebVersion", () => {
  it("SHOULD return the served version WHEN version.json is valid", async () => {
    respond({ builtAt: "2026-10-30T09:00:00Z", version: "1.5.0" });

    expect(await fetchServedWebVersion()).toEqual({
      builtAt: "2026-10-30T09:00:00Z",
      version: "1.5.0",
    });
    expect(fetchMock).toHaveBeenCalledWith("/version.json", {
      cache: "no-store",
    });
  });

  it("SHOULD return null WHEN the response is an error status", async () => {
    respond({}, false);

    expect(await fetchServedWebVersion()).toBeNull();
  });

  it("SHOULD return null WHEN the body is not JSON (SPA fallback HTML)", async () => {
    fetchMock.mockResolvedValue({
      json: async () => {
        throw new SyntaxError("Unexpected token <");
      },
      ok: true,
    });

    expect(await fetchServedWebVersion()).toBeNull();
  });

  it("SHOULD return null WHEN fields are missing or not strings", async () => {
    respond({ version: "1.5.0" });
    expect(await fetchServedWebVersion()).toBeNull();

    respond({ builtAt: 1, version: "1.5.0" });
    expect(await fetchServedWebVersion()).toBeNull();
  });

  it("SHOULD return null WHEN the network fails", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));

    expect(await fetchServedWebVersion()).toBeNull();
  });

  it("SHOULD NOT fetch on native platforms", async () => {
    Platform.OS = "android";

    expect(await fetchServedWebVersion()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("reloadApp", () => {
  it("SHOULD reload the page on web", () => {
    reloadApp();

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("SHOULD do nothing on native", () => {
    Platform.OS = "android";
    reloadApp();

    expect(reloadMock).not.toHaveBeenCalled();
  });
});

describe("reloadOnStaleChunk", () => {
  const chunkError = Object.assign(
    new Error("Loading module /_expo/static/js/web/index-x.js failed."),
    { name: "AsyncRequireError" },
  );

  it("SHOULD recognise a chunk load error", () => {
    expect(isChunkLoadError(chunkError)).toBe(true);
    expect(isChunkLoadError(new Error("Loading module a.js failed."))).toBe(
      true,
    );
    expect(isChunkLoadError(new Error("boom"))).toBe(false);
    expect(isChunkLoadError("AsyncRequireError")).toBe(false);
  });

  it("SHOULD reload the page once for a chunk error", () => {
    expect(reloadOnStaleChunk(chunkError)).toBe(true);
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("SHOULD NOT reload again within a minute, so a missing chunk does not loop", () => {
    reloadOnStaleChunk(chunkError);

    expect(reloadOnStaleChunk(chunkError)).toBe(false);
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("SHOULD NOT reload for other errors", () => {
    expect(reloadOnStaleChunk(new Error("boom"))).toBe(false);
    expect(reloadMock).not.toHaveBeenCalled();
  });

  it("SHOULD NOT reload on native", () => {
    Platform.OS = "android";

    expect(reloadOnStaleChunk(chunkError)).toBe(false);
    expect(reloadMock).not.toHaveBeenCalled();
  });
});
