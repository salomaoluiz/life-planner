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
  render(<GenericErrorBoundary error={error} retry={retrySpy} />);
}

const spies = {
  retry: retrySpy,
};

beforeEach(() => {
  jest.clearAllMocks();
});

const mocks = {};

export { mocks, setup, spies };
export { act, fireEvent, screen } from "@tests";
