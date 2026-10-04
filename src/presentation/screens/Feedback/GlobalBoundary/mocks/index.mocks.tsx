import { render } from "@tests";

import * as storage from "@infrastructure/storage";
import { StorageKeys } from "@infrastructure/storage";
import { translations } from "@presentation/i18n/translations";
import GlobalBoundary from "@screens/Feedback/GlobalBoundary";

// #region mocks

const error = new Error("Error message");

// #endregion mocks

const retrySpy = jest.fn();
const getStringSpy = jest.spyOn(storage.asyncStorage, "getString");

function setup() {
  render(<GlobalBoundary error={error} retry={retrySpy} />);
}

const spies = {
  getString: getStringSpy,
  retry: retrySpy,
};

beforeEach(() => {
  jest.clearAllMocks();
});

const mocks = {
  fallbackKey: StorageKeys.string.FALLBACK_LANGUAGE,
  translations,
};

export { mocks, setup, spies };
export { act, fireEvent, screen } from "@tests";
