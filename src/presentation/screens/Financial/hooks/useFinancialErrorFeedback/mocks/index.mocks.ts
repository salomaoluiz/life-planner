import { router } from "expo-router";

import { renderHook } from "@tests";

import { createFeedbackRouteEncoded } from "@screens/Feedback/BusinessFeedback/utils";

import useFinancialErrorFeedback from "../";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@presentation/i18n/useTranslation", () => ({
  __esModule: true,
  default: () => ({ t: (key: string) => key }),
}));
jest.mock("@screens/Feedback/BusinessFeedback/utils", () => ({
  createFeedbackRouteEncoded: jest.fn(),
}));

// region spies
const spies = {
  encode: jest.mocked(createFeedbackRouteEncoded),
  push: jest.mocked(router.push),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  spies.encode.mockResolvedValue({ feedback: "encoded-feedback" });
});

function setup(error: unknown) {
  return renderHook(
    (props: { error: unknown }) => useFinancialErrorFeedback(props.error),
    { initialProps: { error } },
  );
}

const mocks = {};

export { mocks, setup, spies };
