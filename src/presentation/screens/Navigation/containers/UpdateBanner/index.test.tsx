import { Linking } from "react-native";

import { fireEvent, hasText, render, screen } from "@tests";

import { reloadApp } from "@infrastructure/appInfo";
import useVersionInfo from "@presentation/hooks/useVersionInfo";
import {
  upToDate,
  versionInfo,
} from "@presentation/hooks/useVersionInfo/mocks/useVersionInfo.mocks";

import UpdateBanner from "./";

jest.mock("@infrastructure/appInfo");
jest.mock("@presentation/hooks/useVersionInfo");

const reloadBanner = {
  current: "1.4.0",
  kind: "RELOAD" as const,
  url: null,
  version: "1.5.0",
};
const apkBanner = {
  current: "1.4.0",
  kind: "APK" as const,
  url: "https://example.com/r",
  version: "1.5.0",
};

function setup(banner: ReturnType<typeof versionInfo>["banner"]) {
  const info = versionInfo({ banner, status: { ...upToDate, banner } });
  jest.mocked(useVersionInfo).mockReturnValue(info);
  render(<UpdateBanner />);

  return info;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Linking, "openURL").mockResolvedValue(true);
});

it("SHOULD render nothing WHEN there is no banner", () => {
  setup(null);

  expect(screen.queryByTestId("navigation.update-banner")).toBeNull();
});

it("SHOULD reload the app from the reload banner", () => {
  setup(reloadBanner);

  fireEvent.press(screen.getByTestId("navigation.update-banner-action"));

  expect(reloadApp).toHaveBeenCalledTimes(1);
  expect(hasText('versions.banner.reload {"version":"1.5.0"}')).toBe(true);
});

it("SHOULD open the release page from the APK banner", () => {
  setup(apkBanner);

  fireEvent.press(screen.getByTestId("navigation.update-banner-action"));

  expect(Linking.openURL).toHaveBeenCalledWith("https://example.com/r");
  expect(
    hasText('versions.banner.apk {"current":"1.4.0","latest":"1.5.0"}'),
  ).toBe(true);
});

it("SHOULD hide the action WHEN the APK banner has no release url", () => {
  setup({ ...apkBanner, url: null });

  expect(screen.queryByTestId("navigation.update-banner-action")).toBeNull();
});

it("SHOULD dismiss the banner", () => {
  const info = setup(reloadBanner);

  fireEvent.press(screen.getByTestId("navigation.update-banner-dismiss"));

  expect(info.dismiss).toHaveBeenCalledTimes(1);
});
