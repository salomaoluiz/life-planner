import { act, renderHook, waitFor } from "@testing-library/react-native";
import { AppState } from "react-native";

import { useCases } from "@application/useCases";
import { VersionEntity } from "@domain/entities/version/VersionEntity";
import { fetchServedWebVersion, getAppInfo } from "@infrastructure/appInfo";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import { asyncStorage } from "@infrastructure/storage";

import useVersionInfo from "./";

jest.mock("@infrastructure/fetcher");
jest.mock("@infrastructure/appInfo");
jest.mock("@infrastructure/storage", () => ({
  asyncStorage: { getString: jest.fn(), setString: jest.fn() },
  StorageKeys: { string: { VERSION_BANNER_DISMISSED: "dismissed-key" } },
}));
jest.mock("@application/useCases", () => ({
  useCases: { getVersionInfoUseCase: { execute: jest.fn() } },
}));

const query = new UseQueryFixture<VersionEntity>();
const remove = jest.fn();
function noop() {}

let foreground: (state: string) => void = noop;

function info(appLatest: null | string): VersionEntity {
  return {
    api: {
      builtAt: null,
      current: "1.0.0",
      latest: "1.0.0",
      latestUrl: null,
      releasedAt: null,
      releases: [],
      startedAt: "",
      updateAvailable: false,
    },
    app: {
      latest: appLatest,
      latestUrl: "https://example.com/r",
      releases: [],
    },
    checkedAt: "2026-10-30T10:00:00Z",
    environment: "PRODUCTION",
  };
}

function setup(options: {
  data?: VersionEntity;
  platform?: "android" | "web";
  served?: null | { builtAt: string; version: string };
  status?: "error" | "pending" | "success";
  version?: string;
}) {
  const built = query
    .reset()
    .withStatus(options.status ?? "success")
    .build();
  if (options.data) {
    built.data = options.data;
  }
  jest.mocked(useQuery).mockReturnValue(built as never);
  jest.mocked(getAppInfo).mockReturnValue({
    builtAt: null,
    platform: options.platform ?? "web",
    version: options.version ?? "1.0.0",
  });
  jest.mocked(fetchServedWebVersion).mockResolvedValue(options.served ?? null);

  return { built, ...renderHook(() => useVersionInfo()) };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(asyncStorage.getString).mockReturnValue(null);
  jest.spyOn(AppState, "addEventListener").mockImplementation(((
    _type: string,
    callback: (state: string) => void,
  ) => {
    foreground = callback;
    return { remove };
  }) as never);
});

it("SHOULD configure the query with the polling, stale time and no retry", () => {
  setup({});

  expect(useQuery).toHaveBeenCalledWith(
    expect.objectContaining({
      cacheKey: ["version", "info"],
      refetchInterval: 1800000,
      retry: false,
      staleTime: 600000,
    }),
  );
});

it("SHOULD fetch without refresh by default AND with refresh after checkNow", async () => {
  jest
    .mocked(useCases.getVersionInfoUseCase.execute)
    .mockResolvedValue(info(null));
  const { built, result } = setup({});
  const fetch = jest.mocked(useQuery).mock.calls[0][0].fetch;

  await fetch();
  expect(useCases.getVersionInfoUseCase.execute).toHaveBeenLastCalledWith({
    refresh: false,
  });

  await act(async () => {
    await result.current.checkNow();
  });
  expect(built.refetch).toHaveBeenCalled();
  await jest.mocked(useQuery).mock.calls[0][0].fetch();
  expect(useCases.getVersionInfoUseCase.execute).toHaveBeenLastCalledWith({
    refresh: true,
  });
  await jest.mocked(useQuery).mock.calls[0][0].fetch();
  expect(useCases.getVersionInfoUseCase.execute).toHaveBeenLastCalledWith({
    refresh: false,
  });
});

it("SHOULD be unknown WHILE loading", () => {
  const { result } = setup({ status: "pending" });

  expect(result.current.status.api).toBe("UNKNOWN");
  expect(result.current.info).toBeNull();
});

it("SHOULD report the API as unavailable WHEN the request failed", () => {
  const { result } = setup({ status: "error" });

  expect(result.current.status.api).toBe("UNAVAILABLE");
});

it("SHOULD expose the checked time AND the running version", () => {
  const { result } = setup({ data: info("1.0.0"), version: "1.0.0" });

  expect(result.current.checkedAt).toBe("2026-10-30T10:00:00Z");
  expect(result.current.runningVersion).toBe("1.0.0");
});

it("SHOULD show the reload banner WHEN the served web version is newer", async () => {
  const { result } = setup({
    data: info("1.1.0"),
    served: { builtAt: "2026-10-30T10:00:00Z", version: "1.1.0" },
  });

  await waitFor(() => expect(result.current.banner?.kind).toBe("RELOAD"));
  expect(result.current.servedVersion).toBe("1.1.0");
});

it("SHOULD hide a dismissed banner AND persist the dismissed version", async () => {
  const { result } = setup({
    data: info("1.1.0"),
    served: { builtAt: "2026-10-30T10:00:00Z", version: "1.1.0" },
  });
  await waitFor(() => expect(result.current.banner).not.toBeNull());

  act(() => result.current.dismiss());

  expect(result.current.banner).toBeNull();
  expect(asyncStorage.setString).toHaveBeenCalledWith("dismissed-key", "1.1.0");
});

it("SHOULD show the banner again WHEN a newer version than the dismissed one appears", async () => {
  jest.mocked(asyncStorage.getString).mockReturnValue("1.1.0");
  const { result } = setup({
    data: info("1.2.0"),
    served: { builtAt: "2026-10-30T10:00:00Z", version: "1.2.0" },
  });

  await waitFor(() => expect(result.current.banner?.version).toBe("1.2.0"));
});

it("SHOULD keep a banner hidden WHEN the same version was dismissed", async () => {
  jest.mocked(asyncStorage.getString).mockReturnValue("1.1.0");
  const { result } = setup({
    data: info("1.1.0"),
    served: { builtAt: "2026-10-30T10:00:00Z", version: "1.1.0" },
  });

  await waitFor(() => expect(result.current.servedVersion).toBe("1.1.0"));
  expect(result.current.banner).toBeNull();
});

it("SHOULD do nothing on dismiss WHEN there is no banner", () => {
  const { result } = setup({});

  act(() => result.current.dismiss());

  expect(asyncStorage.setString).not.toHaveBeenCalled();
});

it("SHOULD refetch AND re-read version.json WHEN the app comes to the foreground, not for other states", async () => {
  const { built } = setup({});
  await waitFor(() => expect(fetchServedWebVersion).toHaveBeenCalledTimes(1));

  foreground("background");
  expect(built.refetch).not.toHaveBeenCalled();

  await act(async () => foreground("active"));
  expect(built.refetch).toHaveBeenCalledTimes(1);
  expect(fetchServedWebVersion).toHaveBeenCalledTimes(2);
});

it("SHOULD remove the foreground listener on unmount", () => {
  const { unmount } = setup({});

  unmount();

  expect(remove).toHaveBeenCalled();
});
