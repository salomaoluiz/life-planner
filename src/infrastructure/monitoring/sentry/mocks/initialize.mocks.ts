import * as Sentry from "@sentry/react-native";

import initialize from "@infrastructure/monitoring/sentry/initialize";

jest.mock("@sentry/react-native");

jest.mock("@infrastructure/monitoring/sentry/navigationIntegration", () =>
  jest.fn().mockReturnValue("navigationIntegration"),
);

const initSpy = jest.spyOn(Sentry, "init");

function setup() {
  return initialize();
}

beforeEach(() => {
  jest.clearAllMocks();
});

const spies = {
  init: initSpy,
};

export { setup, spies };
