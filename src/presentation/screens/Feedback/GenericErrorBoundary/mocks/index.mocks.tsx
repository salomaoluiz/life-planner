import { render } from "@tests";
import * as i18n from "@presentation/i18n";
import { GenericErrorBoundary } from "@screens/Feedback";

// #region mocks

const error = new Error("Error message");

// #endregion mocks

const retrySpy = jest.fn();
jest.spyOn(i18n, "useTranslation").mockReturnValue({
  t: (key: string) => key,
});

function setup() {
  render(<GenericErrorBoundary retry={retrySpy} error={error} />);
}

const spies = {
  retry: retrySpy,
};

beforeEach(() => {
  jest.clearAllMocks();
});

const mocks = {};

export { spies, setup, mocks };
export { screen, act, fireEvent } from "@tests";
