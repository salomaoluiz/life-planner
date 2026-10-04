import { router } from "expo-router";

import handleNavigation from "./navigation";
import {
  FeedbackActions,
  FeedbackNavigationTypes,
  NavigationAction,
} from "./types";

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), dismissTo: jest.fn(), push: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD dismiss to the route WHEN the type is DISMISS_TO", () => {
  handleNavigation({
    action: FeedbackActions.NAVIGATION,
    route: "/family",
    type: FeedbackNavigationTypes.DISMISS_TO,
  });

  expect(router.dismissTo).toHaveBeenCalledWith("/family");
});

it("SHOULD go back WHEN the type is GO_BACK", () => {
  handleNavigation({
    action: FeedbackActions.NAVIGATION,
    type: FeedbackNavigationTypes.GO_BACK,
  });

  expect(router.back).toHaveBeenCalledTimes(1);
});

it("SHOULD push the route with params WHEN the type is PUSH", () => {
  handleNavigation({
    action: FeedbackActions.NAVIGATION,
    params: { id: "1" },
    route: "/family",
    type: FeedbackNavigationTypes.PUSH,
  });

  expect(router.push).toHaveBeenCalledWith("/family", { id: "1" });
});

it("SHOULD throw WHEN the navigation type is invalid", () => {
  expect(() =>
    handleNavigation({
      action: FeedbackActions.NAVIGATION,
      type: "NOPE",
    } as unknown as NavigationAction),
  ).toThrow("Invalid navigation type");
});
