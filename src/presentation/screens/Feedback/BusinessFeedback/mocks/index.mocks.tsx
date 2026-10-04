import { useLocalSearchParams } from "expo-router";

import { act, render } from "@tests";

import { useTheme } from "@presentation/theme";

import BusinessFeedback from "../";
import handleAction from "../actions";
import {
  CloseButton,
  FeedbackActions,
  FeedbackButton,
  FeedbackNavigationTypes,
} from "../actions/types";
import { FeedbackType, RouteDecryptedProps } from "../types";
import { decodeRouteParams } from "../utils";

jest.mock("expo-router", () => ({ useLocalSearchParams: jest.fn() }));
jest.mock("../utils", () => ({ decodeRouteParams: jest.fn() }));
jest.mock("../actions", () => ({ __esModule: true, default: jest.fn() }));

// region mocks
const closeButton: CloseButton = {
  action: FeedbackActions.NAVIGATION,
  type: FeedbackNavigationTypes.GO_BACK,
};
const primaryButton: FeedbackButton = {
  action: FeedbackActions.COPY_TO_CLIPBOARD,
  label: "Copy Url",
  value: "https://example.test/invite",
};
function makeRoute(type = FeedbackType.Success): RouteDecryptedProps {
  return {
    closeButton,
    message: "The invite was sent",
    primaryButton,
    title: "Invite sent",
    type,
  };
}
// endregion mocks

// region spies
const spies = {
  decode: jest.mocked(decodeRouteParams),
  handleAction: jest.mocked(handleAction),
  params: jest.mocked(useLocalSearchParams),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  spies.params.mockReturnValue({ feedback: "encoded" });
  spies.decode.mockResolvedValue(makeRoute());
});

async function setup(type = FeedbackType.Success) {
  spies.decode.mockResolvedValue(makeRoute(type));
  render(<BusinessFeedback />);
  await act(async () => undefined);
}

const mocks = { closeButton, primaryButton, theme: () => useTheme().theme };

export { mocks, setup, spies };
export { fireEvent, hasText, screen } from "@tests";
export { BusinessFeedback, render };
