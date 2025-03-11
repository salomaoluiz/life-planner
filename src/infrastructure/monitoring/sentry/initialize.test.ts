import { setup, spies } from "./mocks/initialize.mocks";

it("SHOULD call Sentry.initialize", () => {
  setup();

  expect(spies.init).toHaveBeenCalledTimes(1);
  expect(spies.init).toHaveBeenCalledWith({
    dsn: "your-sentry-dsn",
    enableNativeFramesTracking: false,
    environment: "development",
    integrations: ["navigationIntegration"],
    tracesSampleRate: 1,
    enabled: false,
  });
});
