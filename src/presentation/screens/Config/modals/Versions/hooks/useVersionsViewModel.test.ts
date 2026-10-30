import { act, renderHook } from "@testing-library/react-native";
import { router } from "expo-router";
import { Linking } from "react-native";

import { ReleaseEntity } from "@domain/entities/version/VersionEntity";
import { reloadApp } from "@infrastructure/appInfo";
import useVersionInfo from "@presentation/hooks/useVersionInfo";
import {
  info,
  upToDate,
  versionInfo,
} from "@presentation/hooks/useVersionInfo/mocks/useVersionInfo.mocks";

import { useVersionsViewModel } from "./";

jest.mock("expo-router", () => ({ router: { back: jest.fn() } }));
jest.mock("@infrastructure/appInfo");
jest.mock("@presentation/hooks/useVersionInfo");
jest.mock("@presentation/i18n/useLocaleTag", () => ({
  __esModule: true,
  default: () => "en-US",
}));

function release(version: string): ReleaseEntity {
  return {
    publishedAt: "2026-10-30T09:00:00Z",
    sections: [{ items: [`note ${version}`], type: "ADDED" }],
    url: `https://example.com/releases/tag/v${version}`,
    version,
  };
}

function setup(overrides: Parameters<typeof versionInfo>[0] = {}) {
  const value = versionInfo(overrides);
  jest.mocked(useVersionInfo).mockReturnValue(value);

  return { ...renderHook(() => useVersionsViewModel()), value };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Linking, "openURL").mockResolvedValue(true);
});

describe("cards", () => {
  it("SHOULD describe the app and the API", () => {
    const { result } = setup();
    const [app, api] = result.current.cards;

    expect(app).toMatchObject({
      label: "versions.card.appWeb",
      statusKey: "versions.status.upToDate",
      version: "1.4.0",
      whatChanged: false,
    });
    expect(app.fields.map((f) => f.key)).toEqual([
      "versions.field.build",
      "versions.field.released",
      "versions.field.liveVersion",
      "versions.field.latest",
    ]);
    expect(api).toMatchObject({
      label: "versions.card.api",
      version: "1.12.0",
    });
    expect(api.fields.map((f) => f.key)).toContain("versions.field.liveSince");
    expect(result.current.environment).toBe("PRODUCTION");
  });

  it("SHOULD offer a reload WHEN the web app is behind the served version", () => {
    const { result } = setup({
      servedVersion: "1.5.0",
      status: { ...upToDate, app: "RELOAD" },
    });
    const [app] = result.current.cards;

    expect(app.action).toEqual({ kind: "reload", version: "1.5.0" });
    expect(app.hint).toEqual({ key: "versions.hint.reload", version: "1.5.0" });

    act(() => result.current.onAction("app"));
    expect(reloadApp).toHaveBeenCalledTimes(1);
  });

  it("SHOULD offer the release page WHEN the APK is behind", () => {
    const { result } = setup({
      info: {
        ...info,
        app: {
          latest: "1.5.0",
          latestUrl: "https://example.com/r",
          releases: [],
        },
      },
      platform: "android",
      status: { ...upToDate, app: "APK_BEHIND" },
    });
    const [app] = result.current.cards;

    expect(app.label).toBe("versions.card.appAndroid");
    expect(app.action).toEqual({ kind: "release", version: "1.5.0" });
    expect(app.fields.map((f) => f.key)).not.toContain(
      "versions.field.liveVersion",
    );

    act(() => result.current.onAction("app"));
    expect(Linking.openURL).toHaveBeenCalledWith("https://example.com/r");
  });

  it("SHOULD show a pending web deploy AND a pending API deploy as hints WITHOUT actions", () => {
    const { result } = setup({
      info: {
        ...info,
        api: { ...info.api, latest: "1.13.0", updateAvailable: true },
        app: { latest: "1.5.0", latestUrl: null, releases: [] },
      },
      status: {
        ...upToDate,
        api: "DEPLOY_PENDING",
        app: "DEPLOY_PENDING",
        updates: 2,
      },
    });
    const [app, api] = result.current.cards;

    expect(app.hint).toEqual({
      key: "versions.hint.appPending",
      version: "1.5.0",
    });
    expect(api.hint).toEqual({
      key: "versions.hint.apiPending",
      version: "1.13.0",
    });
    expect(app.action).toBeUndefined();
    act(() => result.current.onAction("api"));
    expect(Linking.openURL).not.toHaveBeenCalled();
    expect(reloadApp).not.toHaveBeenCalled();
  });

  it("SHOULD show dashes AND the API down status WHEN the API never answered", () => {
    const { result } = setup({
      checkedAt: null,
      info: null,
      status: { ...upToDate, api: "UNAVAILABLE" },
    });
    const [, api] = result.current.cards;

    expect(api.version).toBe("—");
    expect(api.statusKey).toBe("versions.status.apiDown");
    expect(api.tone).toBe("expense");
    expect(result.current.environment).toBeNull();
    expect(result.current.checked).toBeNull();
  });

  it("SHOULD show the release date of the running app version", () => {
    const { result } = setup({
      info: {
        ...info,
        app: { latest: "1.4.0", latestUrl: null, releases: [release("1.4.0")] },
      },
    });

    expect(result.current.cards[0].fields[1].value).toMatch(/10\/30\/26/);
  });
});

describe("what changed", () => {
  const api = {
    ...info.api,
    current: "1.12.0",
    latest: "1.14.0",
    latestUrl: "https://example.com/releases/tag/v1.14.0",
    releases: [release("1.14.0"), release("1.13.0"), release("1.12.0")],
    updateAvailable: true,
  };

  it("SHOULD list the releases newer than the running version, newest first", () => {
    const { result } = setup({ info: { ...info, api } });

    expect(result.current.cards[1].whatChanged).toBe(true);

    act(() => result.current.onWhatChanged("api"));

    expect(result.current.changes?.releases.map((r) => r.version)).toEqual([
      "1.14.0",
      "1.13.0",
    ]);
    expect(result.current.changes).toMatchObject({
      latestUrl: "https://example.com/releases/tag/v1.14.0",
      running: "1.12.0",
      service: "api",
      truncated: false,
    });
  });

  it("SHOULD go back to the summary", () => {
    const { result } = setup({ info: { ...info, api } });
    act(() => result.current.onWhatChanged("api"));

    act(() => result.current.onBack());

    expect(result.current.changes).toBeNull();
  });

  it("SHOULD say the list is truncated WHEN the running version is older than the 10 returned", () => {
    const releases = Array.from({ length: 10 }, (_, index) =>
      release(`1.${20 - index}.0`),
    );
    const { result } = setup({
      info: { ...info, api: { ...api, current: "1.5.0", releases } },
    });

    act(() => result.current.onWhatChanged("api"));

    expect(result.current.changes?.truncated).toBe(true);
  });

  it("SHOULD open the latest release on GitHub", () => {
    const { result } = setup({ info: { ...info, api } });

    act(() => result.current.onOpenGithub("https://example.com/x"));

    expect(Linking.openURL).toHaveBeenCalledWith("https://example.com/x");
  });

  it("SHOULD list the app releases newer than the running version", () => {
    const { result } = setup({
      info: {
        ...info,
        app: {
          latest: "1.5.0",
          latestUrl: "https://example.com/app",
          releases: [release("1.5.0"), release("1.4.0")],
        },
      },
    });

    act(() => result.current.onWhatChanged("app"));

    expect(result.current.changes?.releases.map((r) => r.version)).toEqual([
      "1.5.0",
    ]);
    expect(result.current.changes?.service).toBe("app");
  });
});

describe("actions", () => {
  it("SHOULD check now AND close", async () => {
    const { result, value } = setup();

    await act(async () => result.current.onCheckNow());
    act(() => result.current.onClose());

    expect(value.checkNow).toHaveBeenCalledTimes(1);
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it("SHOULD describe how long ago it was checked", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-10-30T10:00:00Z"));
    const { result } = setup();

    expect(result.current.checked).toEqual({
      count: 2,
      key: "versions.timeAgo.minutes",
    });
    jest.useRealTimers();
  });
});
