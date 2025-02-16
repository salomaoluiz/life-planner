import * as Sentry from "@sentry/react-native";

jest.mock("@sentry/react-native");

jest.mock("./navigationIntegration", () =>
  jest.fn().mockReturnValue("navigationIntegration"),
);

import sentryInitialize from "./initialize";

const initSpy = jest.spyOn(Sentry, "init");

process.env = {
  NODE_ENV: "test",
  EXPO_PUBLIC_SENTRY_DSN: "your-sentry-dsn",
  EXPO_PUBLIC_SENTRY_URL: "https://sentry.io/",
  EXPO_PUBLIC_SENTRY_TRACES_SAMPLER: "1",
  EXPO_PUBLIC_SENTRY_ENVIRONMENT: "test",
};

it("SHOULD call Sentry.addBreadcrumb", () => {
  sentryInitialize();

  expect(initSpy).toHaveBeenCalledTimes(1);
  expect(initSpy).toHaveBeenCalledWith({
    dsn: "your-sentry-dsn",
    enableNativeFramesTracking: false,
    environment: "test",
    integrations: ["navigationIntegration"],
    tracesSampleRate: 1,
    enabled: false,
  });
});
