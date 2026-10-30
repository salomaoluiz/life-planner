import { fireEvent, hasText, render, screen } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import useVersionInfo from "@presentation/hooks/useVersionInfo";
import {
  info,
  upToDate,
  versionInfo,
} from "@presentation/hooks/useVersionInfo/mocks/useVersionInfo.mocks";

import settingsTestIds from "../../testIds";
import Versions from "./";

jest.mock("@presentation/hooks/useVersionInfo");

function setup(overrides: Parameters<typeof versionInfo>[0] = {}) {
  jest.mocked(useVersionInfo).mockReturnValue(versionInfo(overrides));
  render(<Versions />);
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD show the versions, the production environment as plain text and the up to date chip", () => {
  setup();

  expect(hasText('versions.footer {"api":"1.12.0","app":"1.4.0"}')).toBe(true);
  expect(screen.getByTestId(settingsTestIds.versionsEnvironment)).toBeTruthy();
  expect(hasText("· versions.env.production")).toBe(true);
  expect(hasText("versions.status.upToDate {}")).toBe(true);
});

it("SHOULD show Staging as a chip", () => {
  setup({ info: { ...info, environment: "STAGING" } });

  expect(hasText("versions.env.staging")).toBe(true);
});

it("SHOULD hide the environment WHILE the API has not answered AND show the not checked chip", () => {
  setup({
    info: null,
    status: { ...upToDate, api: "UNKNOWN", app: "UNKNOWN" },
  });

  expect(screen.queryByTestId(settingsTestIds.versionsEnvironment)).toBeNull();
  expect(hasText("versions.status.unknown {}")).toBe(true);
});

it("SHOULD show the pending updates", () => {
  setup({ status: { ...upToDate, api: "DEPLOY_PENDING", updates: 1 } });

  expect(hasText('versions.status.updates_one {"count":1}')).toBe(true);
});

it("SHOULD say the API is unavailable", () => {
  setup({ info: null, status: { ...upToDate, api: "UNAVAILABLE" } });

  expect(hasText("versions.status.apiDown {}")).toBe(true);
});

it("SHOULD open the versions modal WHEN pressed", () => {
  setup();

  fireEvent.press(screen.getByTestId(settingsTestIds.versionsFooter));

  expect(modalNavigation.openModal).toHaveBeenCalledWith("versions");
});
