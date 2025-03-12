import * as Sentry from "@sentry/react-native";

import { sentrySetTag } from "@infrastructure/monitoring/sentry";

const setTagSpy = jest.spyOn(Sentry, "setTag");

beforeEach(() => {
  jest.clearAllMocks();
});

const spies = {
  setTag: setTagSpy,
};

function setup(...params: Parameters<typeof sentrySetTag>) {
  sentrySetTag(...params);
}

export { setup, spies };
