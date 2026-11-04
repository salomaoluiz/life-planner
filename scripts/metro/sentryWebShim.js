// Web only (spec 089): the app configures neither Session Replay nor the feedback widget,
// but @sentry/browser imports both packages eagerly (~400 KB of source in the entry chunk).
// Metro resolves them to this no-op module on web. Native bundles are untouched.
function noop() {
  return undefined;
}

module.exports = {
  buildFeedbackIntegration: noop,
  feedbackModalIntegration: noop,
  feedbackScreenshotIntegration: noop,
  getFeedback: noop,
  getReplay: noop,
  replayCanvasIntegration: noop,
  replayIntegration: noop,
  sendFeedback: noop,
};
