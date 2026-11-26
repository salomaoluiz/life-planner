import { router } from "expo-router";

import { fireEvent, render, screen } from "@tests";

import NotificationsLink from "./";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));

it("SHOULD open Configurações › Notificações", () => {
  render(<NotificationsLink />);

  fireEvent.press(screen.getByTestId("settings-notifications-link"));

  expect(router.push).toHaveBeenCalledWith("/notification-settings");
});
