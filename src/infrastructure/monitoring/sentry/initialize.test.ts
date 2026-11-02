import { setup, spies } from "./mocks/initialize.mocks";

it("SHOULD call Sentry.initialize", () => {
  setup();

  expect(spies.init).toHaveBeenCalledTimes(1);
  expect(spies.init).toHaveBeenCalledWith({
    dsn: "your-sentry-dsn",
    enabled: false,
    enableNativeFramesTracking: false,
    environment: "development",
    integrations: ["navigationIntegration"],
    tracesSampleRate: 1,
  });
});

it.each([
  ["0.2", 0.2],
  ["1", 1],
  ["not-a-number", 0],
  ["5", 1],
])("SHOULD read the traces sample rate %s as %s", (value, rate) => {
  const previous = process.env.EXPO_PUBLIC_SENTRY_TRACES_SAMPLER;

  process.env.EXPO_PUBLIC_SENTRY_TRACES_SAMPLER = value;
  setup();
  process.env.EXPO_PUBLIC_SENTRY_TRACES_SAMPLER = previous;

  expect(spies.init).toHaveBeenCalledWith(
    expect.objectContaining({ tracesSampleRate: rate }),
  );
});
