import { router, useRootNavigationState } from "expo-router";

import { renderHook } from "@tests";

import { setE2eCsvFixture } from "@infrastructure/filePicker";
import { isWeb } from "@utils/platform";

import { currentHash } from "../utils/currentHash";
import useE2eCsvViewModel from "./useE2eCsvViewModel";

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
  useRootNavigationState: jest.fn(),
}));
jest.mock("@infrastructure/filePicker", () => ({
  setE2eCsvFixture: jest.fn(),
}));
jest.mock("@utils/platform", () => ({ isWeb: jest.fn() }));
jest.mock("../utils/currentHash", () => ({ currentHash: jest.fn() }));

const originalEnv = process.env.EXPO_PUBLIC_E2E_LOGIN;

function setHash(hash: string) {
  jest.mocked(currentHash).mockReturnValue(hash);
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRootNavigationState).mockReturnValue({ key: "k" } as never);
  jest.mocked(isWeb).mockReturnValue(true);
  process.env.EXPO_PUBLIC_E2E_LOGIN = "true";
});

afterEach(() => {
  process.env.EXPO_PUBLIC_E2E_LOGIN = originalEnv;
});

describe("useE2eCsvViewModel", () => {
  it("SHOULD leave the fixture for the next pick and go home", () => {
    setHash("#name=extrato.csv&csv=a%3Bb");

    renderHook(() => useE2eCsvViewModel());

    expect(setE2eCsvFixture).toHaveBeenCalledWith({
      bytes: new TextEncoder().encode("a;b"),
      name: "extrato.csv",
      size: 3,
    });
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("SHOULD go to the login without a csv, and never set a fixture", () => {
    setHash("");

    renderHook(() => useE2eCsvViewModel());

    expect(setE2eCsvFixture).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith("/login");
  });

  it("SHOULD refuse when the E2E flag is off", () => {
    process.env.EXPO_PUBLIC_E2E_LOGIN = "false";
    setHash("#csv=a");

    renderHook(() => useE2eCsvViewModel());

    expect(setE2eCsvFixture).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith("/login");
  });

  it("SHOULD wait until the navigation is ready", () => {
    jest.mocked(useRootNavigationState).mockReturnValue(undefined as never);
    setHash("#csv=a");

    renderHook(() => useE2eCsvViewModel());

    expect(router.replace).not.toHaveBeenCalled();
  });
});
