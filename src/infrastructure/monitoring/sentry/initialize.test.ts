import * as Sentry from "@sentry/react-native";

jest.mock("@sentry/react-native");

jest.mock("./navigationIntegration", () =>
  jest.fn().mockReturnValue("navigationIntegration"),
);

import sentryInitialize from "./initialize";

const initSpy = jest.spyOn(Sentry, "init");

it("SHOULD call Sentry.initialize", () => {
  sentryInitialize();

  expect(initSpy).toHaveBeenCalledTimes(1);
  expect(initSpy).toHaveBeenCalledWith({
    dsn: "your-sentry-dsn",
    enableNativeFramesTracking: false,
    environment: "development",
    integrations: ["navigationIntegration"],
    tracesSampleRate: 1,
    enabled: false,
  });
});
