import * as Sentry from "@sentry/react-native";

import { BusinessError } from "@domain/entities/errors/common";

import { setup, spies } from "./mocks/initialize.mocks";

it("SHOULD call Sentry.initialize", () => {
  setup();

  expect(spies.init).toHaveBeenCalledTimes(1);
  expect(spies.init).toHaveBeenCalledWith({
    beforeBreadcrumb: expect.any(Function),
    beforeSend: expect.any(Function),
    dsn: "your-sentry-dsn",
    enabled: false,
    enableNativeFramesTracking: false,
    environment: "development",
    integrations: ["navigationIntegration"],
    release: "life-planner@0.0.0",
    sendDefaultPii: false,
    tracePropagationTargets: expect.any(Array),
    tracesSampleRate: 1,
  });
});

function options() {
  setup();

  return spies.init.mock.calls[0][0] as Required<
    Pick<Sentry.ReactNativeOptions, "beforeBreadcrumb" | "beforeSend">
  > & { tracePropagationTargets: string[] };
}

it("SHOULD drop expected errors AND scrub the rest in beforeSend", () => {
  const { beforeSend } = options();
  const event = { request: { data: { a: 1 }, url: "/x?q=milk" } };

  expect(
    beforeSend(event as never, { originalException: new BusinessError() }),
  ).toBeNull();
  expect(
    beforeSend(event as never, { originalException: new Error("boom") }),
  ).toEqual({ request: { headers: {}, url: "/x?q=[redacted]" } });
});

it("SHOULD keep console breadcrumbs only from warning up AND scrub urls", () => {
  const { beforeBreadcrumb } = options();

  expect(
    beforeBreadcrumb({ category: "console", level: "log" }, {}),
  ).toBeNull();
  expect(
    beforeBreadcrumb({ category: "console", level: "warning" }, {}),
  ).not.toBeNull();
  expect(
    beforeBreadcrumb({ category: "fetch", data: { url: "/a?q=s" } }, {}),
  ).toEqual({ category: "fetch", data: { url: "/a?q=[redacted]" } });
});

it("SHOULD propagate the trace only to the API", () => {
  process.env.EXPO_PUBLIC_API_URL = "https://api.example.com";

  expect(options().tracePropagationTargets).toEqual([
    "https://api.example.com",
  ]);

  delete process.env.EXPO_PUBLIC_API_URL;
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
