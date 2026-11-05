import shim from "./sentryWebShim";

it("SHOULD expose no-op replacements for the Sentry replay and feedback exports", () => {
  expect(Object.keys(shim).sort()).toEqual([
    "buildFeedbackIntegration",
    "feedbackModalIntegration",
    "feedbackScreenshotIntegration",
    "getFeedback",
    "getReplay",
    "replayCanvasIntegration",
    "replayIntegration",
    "sendFeedback",
  ]);
  Object.values<() => unknown>(shim).forEach((fn) => {
    expect(fn()).toBeUndefined();
  });
});
