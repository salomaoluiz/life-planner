import Constants from "expo-constants";
import { Platform } from "react-native";

import { fetchServedWebVersion, getAppInfo, reloadApp } from "./";

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: { extra: {}, version: "1.4.0" } },
}));

const fetchMock = jest.fn();
const reloadMock = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
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
