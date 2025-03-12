import * as Sentry from "@sentry/react-native";

import { sentrySetContext } from "@infrastructure/monitoring/sentry";

const setContextSpy = jest.spyOn(Sentry, "setContext");

beforeEach(() => {
  jest.clearAllMocks();
});

const spies = {
  setContext: setContextSpy,
};

function setup(...params: Parameters<typeof sentrySetContext>) {
  sentrySetContext(...params);
}

export { setup, spies };
