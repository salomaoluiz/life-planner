import handleAction from "./";
import handleCopyToClipboard from "./copyToClipboard";
import handleNavigation from "./navigation";
import {
  FeedbackActions,
  FeedbackButtonAction,
  FeedbackNavigationTypes,
} from "./types";

jest.mock("./copyToClipboard", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("./navigation", () => ({ __esModule: true, default: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD copy to clipboard WHEN the action is COPY_TO_CLIPBOARD", async () => {
  const action = {
    action: FeedbackActions.COPY_TO_CLIPBOARD,
    value: "text",
  } as const;

  await handleAction(action);

  expect(handleCopyToClipboard).toHaveBeenCalledWith(action);
  expect(handleNavigation).not.toHaveBeenCalled();
});

it("SHOULD navigate WHEN the action is NAVIGATION", async () => {
  const action = {
    action: FeedbackActions.NAVIGATION,
    type: FeedbackNavigationTypes.GO_BACK,
  } as const;

  await handleAction(action);

  expect(handleNavigation).toHaveBeenCalledWith(action);
  expect(handleCopyToClipboard).not.toHaveBeenCalled();
});

it("SHOULD reject WHEN the action is invalid", async () => {
  await expect(
    handleAction({ action: "NOPE" } as unknown as FeedbackButtonAction),
  ).rejects.toThrow("Invalid action type");
});
