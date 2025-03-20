import { router } from "expo-router";

import {
  FeedbackNavigationTypes,
  NavigationAction,
  NavigationDismissToAction,
  NavigationPushAction,
} from "./types";

function handleNavigation(props: NavigationAction) {
  switch (props.type) {
    case FeedbackNavigationTypes.DISMISS_TO:
      return handleNavigationDismissTo(props);
    case FeedbackNavigationTypes.GO_BACK:
      return handleNavigationGoBack();
    case FeedbackNavigationTypes.PUSH:
      return handleNavigationPush(props);
    default:
      throw new Error("Invalid navigation type");
  }
}

function handleNavigationDismissTo(props: NavigationDismissToAction) {
  router.dismissTo(props.route);
}

function handleNavigationGoBack() {
  router.back();
}

function handleNavigationPush(props: NavigationPushAction) {
  router.push(props.route, props.params);
}

export default handleNavigation;
