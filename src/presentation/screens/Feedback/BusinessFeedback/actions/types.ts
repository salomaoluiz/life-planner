import { Href } from "expo-router";

export enum FeedbackActions {
  "COPY_TO_CLIPBOARD" = "COPY_TO_CLIPBOARD",
  "NAVIGATION" = "NAVIGATION",
}

export enum FeedbackNavigationTypes {
  DISMISS_TO = "DISMISS_TO",
  GO_BACK = "GO_BACK",
  PUSH = "PUSH",
}

export type CloseButton = NavigationAction;

export type FeedbackButton = ButtonBase & FeedbackButtonAction;

export type FeedbackButtonAction = CopyToClipboardAction | NavigationAction;

interface ButtonBase {
  label: string;
}

interface CopyToClipboardAction {
  action: FeedbackActions.COPY_TO_CLIPBOARD;
  value: string;
}

type NavigationAction =
  | NavigationDismissToAction
  | NavigationGoBackAction
  | NavigationPushAction;

interface NavigationDismissToAction {
  action: FeedbackActions.NAVIGATION;
  route: Href;
  type: FeedbackNavigationTypes.DISMISS_TO;
}

interface NavigationGoBackAction {
  action: FeedbackActions.NAVIGATION;
  type: FeedbackNavigationTypes.GO_BACK;
}

interface NavigationPushAction {
  action: FeedbackActions.NAVIGATION;
  params?: Record<string, unknown>;
  route: Href;
  type: FeedbackNavigationTypes.PUSH;
}

export { CopyToClipboardAction, NavigationAction };
export {
  NavigationDismissToAction,
  NavigationGoBackAction,
  NavigationPushAction,
};
