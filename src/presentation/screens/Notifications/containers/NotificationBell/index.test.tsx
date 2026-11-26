import { router } from "expo-router";

import { fireEvent, render, screen } from "@tests";

import useUnreadCount from "@screens/Notifications/hooks/useUnreadCount";
import notificationsTestIds from "@screens/Notifications/testIds";

import NotificationBell from "./";

jest.unmock("@screens/Notifications/containers/NotificationBell");
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@screens/Notifications/hooks/useUnreadCount");

beforeEach(() => jest.clearAllMocks());

it("SHOULD show the unread count on the bell AND open the center on press", () => {
  jest.mocked(useUnreadCount).mockReturnValue({ count: 3 } as never);

  render(<NotificationBell />);
  fireEvent.press(screen.getByTestId(notificationsTestIds.bell));

  expect(
    screen.getByTestId(`${notificationsTestIds.bellBadge}-label`).props
      .children,
  ).toBe("3");
  expect(router.push).toHaveBeenCalledWith("/notifications");
});

it("SHOULD cap the badge at 9+", () => {
  jest.mocked(useUnreadCount).mockReturnValue({ count: 25 } as never);

  render(<NotificationBell />);

  expect(
    screen.getByTestId(`${notificationsTestIds.bellBadge}-label`).props
      .children,
  ).toBe("9+");
});

it("SHOULD show no badge WHEN everything is read", () => {
  jest.mocked(useUnreadCount).mockReturnValue({ count: 0 } as never);

  render(<NotificationBell />);

  expect(screen.queryByTestId(notificationsTestIds.bellBadge)).toBeNull();
});
