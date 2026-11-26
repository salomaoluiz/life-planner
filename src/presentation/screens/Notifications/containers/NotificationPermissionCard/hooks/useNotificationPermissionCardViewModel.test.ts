import { act, renderHook } from "@testing-library/react-native";

import { useQuery } from "@infrastructure/fetcher";
import { asyncStorage } from "@infrastructure/storage";
import usePushDevice from "@screens/Notifications/hooks/usePushDevice";
import useUnreadCount from "@screens/Notifications/hooks/useUnreadCount";

import useNotificationPermissionCardViewModel, {
  DISMISS_KEY,
  isDismissed,
} from "./useNotificationPermissionCardViewModel";

jest.mock("@infrastructure/fetcher", () => ({ useQuery: jest.fn() }));
jest.mock("@infrastructure/storage", () => ({
  asyncStorage: { getString: jest.fn(), setString: jest.fn() },
}));
jest.mock("@utils/platform", () => ({ isWeb: jest.fn(() => false) }));
jest.mock("@screens/Notifications/hooks/usePushDevice");
jest.mock("@screens/Notifications/hooks/useUnreadCount");
jest.mock("@application/useCases", () => ({
  useCases: {
    getNotificationPreferencesUseCase: { execute: jest.fn() },
    getNotificationSummaryPreviewUseCase: { execute: jest.fn() },
  },
}));

const enable = jest.fn();

function setup({
  device = {},
  hasItems = true,
  stored = null,
  unread = 0,
}: {
  device?: Record<string, unknown>;
  hasItems?: boolean;
  stored?: null | string;
  unread?: number;
} = {}) {
  jest.mocked(asyncStorage.getString).mockReturnValue(stored);
  jest.mocked(useUnreadCount).mockReturnValue({ count: unread } as never);
  jest.mocked(usePushDevice).mockReturnValue({
    enable,
    isEnabling: false,
    isLoaded: true,
    isRegistered: false,
    needsHomeScreenInstall: false,
    openSystemSettings: jest.fn(),
    permission: "undetermined",
    ...device,
  } as never);
  jest
    .mocked(useQuery)
    .mockImplementation(((options: { cacheKey: string[] }) =>
      options.cacheKey[1] === "preview"
        ? { data: { count: 5, hasItems } }
        : { data: { summaryTime: "08:30" } }) as never);

  return renderHook(() => useNotificationPermissionCardViewModel());
}

beforeEach(() => jest.clearAllMocks());

describe("isDismissed", () => {
  it('SHOULD hide the card for 30 days after "Agora não"', () => {
    const now = Date.now();

    expect(isDismissed(String(now - 29 * 86_400_000), now)).toBe(true);
    expect(isDismissed(String(now - 31 * 86_400_000), now)).toBe(false);
    expect(isDismissed(null, now)).toBe(false);
    expect(isDismissed("garbage", now)).toBe(false);
  });
});

it("SHOULD invite WHEN there is something to tell, the device is not registered and nothing was dismissed", () => {
  const { result } = setup();

  expect(result.current.mode).toBe("invite");
  expect(result.current.count).toBe(5);
  expect(result.current.summaryTime).toBe("08:30");
});

it("SHOULD invite WHEN there are only unread notices", () => {
  expect(setup({ hasItems: false, unread: 1 }).result.current.mode).toBe(
    "invite",
  );
});

it.each([
  ["nothing to tell", { hasItems: false }],
  ["the device is registered", { device: { isRegistered: true } }],
  ["the list is not loaded", { device: { isLoaded: false } }],
  ["push is unsupported", { device: { permission: "unsupported" } }],
  ["the card was dismissed", { stored: String(Date.now()) }],
])("SHOULD stay hidden WHEN %s", (_title, options) => {
  expect(setup(options).result.current.mode).toBe("hidden");
});

it("SHOULD explain the Home Screen WHEN iOS web cannot push, AND offer the way out WHEN blocked", () => {
  expect(
    setup({ device: { needsHomeScreenInstall: true } }).result.current.mode,
  ).toBe("ios-web");
  const blocked = setup({ device: { permission: "denied" } }).result;

  expect(blocked.current.mode).toBe("blocked");
  expect(blocked.current.canOpenSettings).toBe(true);
});

it('SHOULD request the permission on "Ativar" AND hide the card for 30 days on "Agora não"', async () => {
  const { result } = setup();

  await act(async () => result.current.onEnable());
  act(() => result.current.onLater());
  await result.current.onOpenSettings();

  expect(enable).toHaveBeenCalledTimes(1);
  expect(asyncStorage.setString).toHaveBeenCalledWith(
    DISMISS_KEY,
    expect.any(String),
  );
  expect(result.current.mode).toBe("hidden");
});
