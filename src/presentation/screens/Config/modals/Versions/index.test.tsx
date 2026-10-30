import { fireEvent, hasText, render, screen } from "@tests";

import { ReleaseEntity } from "@domain/entities/version/VersionEntity";
import useVersionInfo from "@presentation/hooks/useVersionInfo";
import {
  info,
  upToDate,
  versionInfo,
} from "@presentation/hooks/useVersionInfo/mocks/useVersionInfo.mocks";

import VersionsModal from "./";
import versionsTestIds from "./testIds";

jest.mock("expo-router", () => ({ router: { back: jest.fn() } }));
jest.mock("@infrastructure/appInfo");
jest.mock("@presentation/hooks/useVersionInfo");
jest.mock("@presentation/i18n/useLocaleTag", () => ({
  __esModule: true,
  default: () => "en-US",
}));

const releases: ReleaseEntity[] = ["1.14.0", "1.13.0"].map((version) => ({
  publishedAt: "2026-10-30T09:00:00Z",
  sections: [{ items: [`note ${version}`], type: "ADDED" as const }],
  url: `https://example.com/v${version}`,
  version,
}));

function setup(overrides: Parameters<typeof versionInfo>[0] = {}) {
  jest.mocked(useVersionInfo).mockReturnValue(versionInfo(overrides));
  render(<VersionsModal />);
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD render both cards, the check now and the close buttons", () => {
  setup();

  expect(screen.getByTestId(versionsTestIds.appCard)).toBeOnTheScreen();
  expect(screen.getByTestId(versionsTestIds.apiCard)).toBeOnTheScreen();
  expect(screen.getByTestId(versionsTestIds.checkNowButton)).toBeOnTheScreen();
  expect(screen.getByTestId(versionsTestIds.closeButton)).toBeOnTheScreen();
  expect(hasText("versions.title")).toBe(true);
  expect(hasText("1.12.0")).toBe(true);
});

it("SHOULD say it was never checked WHEN there is no check time", () => {
  setup({ checkedAt: null, info: { ...info, checkedAt: null } });

  expect(hasText("versions.checkedNever")).toBe(true);
});

it("SHOULD show the what changed view AND come back", () => {
  setup({
    info: {
      ...info,
      api: { ...info.api, latestUrl: "https://example.com/v1.14.0", releases },
    },
    status: { ...upToDate, api: "DEPLOY_PENDING", updates: 1 },
  });

  fireEvent.press(
    screen.getByTestId(`${versionsTestIds.whatChangedButton}.api`),
  );

  expect(screen.getByTestId(versionsTestIds.changes)).toBeOnTheScreen();
  expect(hasText("versions.changes.titleApi")).toBe(true);
  expect(hasText("• note 1.14.0")).toBe(true);
  expect(hasText("• note 1.13.0")).toBe(true);
  expect(screen.getByTestId(versionsTestIds.githubButton)).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(versionsTestIds.backButton));

  expect(screen.queryByTestId(versionsTestIds.changes)).toBeNull();
  expect(screen.getByTestId(versionsTestIds.apiCard)).toBeOnTheScreen();
});

it("SHOULD show the empty line WHEN the running version is the latest", () => {
  setup({ info: { ...info, api: { ...info.api, releases: [] } } });

  expect(
    screen.queryByTestId(`${versionsTestIds.whatChangedButton}.api`),
  ).toBeNull();
});

it("SHOULD disable GitHub WHEN there is no release url", () => {
  setup({
    info: { ...info, app: { latest: "1.5.0", latestUrl: null, releases } },
  });

  fireEvent.press(
    screen.getByTestId(`${versionsTestIds.whatChangedButton}.app`),
  );

  expect(hasText("versions.changes.titleApp")).toBe(true);
  expect(
    screen.getByTestId(versionsTestIds.githubButton).props.accessibilityState
      .disabled,
  ).toBe(true);
});
