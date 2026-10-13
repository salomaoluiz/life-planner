import { Redirect } from "expo-router";

import { render } from "@tests";

import LegacyConfigRedirect from "./";

jest.mock("expo-router", () => ({ Redirect: jest.fn(() => null) }));

it("SHOULD redirect the old /config URL to /settings", () => {
  render(<LegacyConfigRedirect />);

  expect(jest.mocked(Redirect).mock.calls[0][0]).toEqual({
    href: "/settings",
  });
});
