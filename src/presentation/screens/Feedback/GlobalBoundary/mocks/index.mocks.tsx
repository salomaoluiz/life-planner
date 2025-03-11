import { render } from "@tests";
import GlobalBoundary from "@screens/Feedback/GlobalBoundary";
import * as storage from "@infrastructure/storage";
import { StorageKeys } from "@infrastructure/storage";

// #region mocks

const error = new Error("Error message");

// #endregion mocks

const retrySpy = jest.fn();
const getStringSpy = jest.spyOn(storage.asyncStorage, "getString");

function setup() {
  render(<GlobalBoundary retry={retrySpy} error={error} />);
}

const spies = {
  retry: retrySpy,
  getString: getStringSpy,
};

beforeEach(() => {
  jest.clearAllMocks();
});

const mocks = {
  fallbackKey: StorageKeys.string.FALLBACK_LANGUAGE,
};

export { spies, setup, mocks };
export { screen, act, fireEvent } from "@tests";
