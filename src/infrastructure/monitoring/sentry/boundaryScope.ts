import * as Sentry from "@sentry/react-native";

import { buildCaptureOptions } from "./errorDetails";

// ErrorBoundary captures through the SDK, not through `captureException`: give its event the same
// error_context, error_code tag and fingerprint (spec 106).
function sentryPrepareBoundaryScope(scope: Sentry.Scope, error: unknown) {
  const { contexts, fingerprint, tags } = buildCaptureOptions(error);

  Object.entries(contexts ?? {}).forEach(([key, value]) =>
    scope.setContext(key, value),
  );
  Object.entries(tags ?? {}).forEach(([key, value]) =>
    scope.setTag(key, value),
  );

  if (fingerprint) {
    scope.setFingerprint(fingerprint);
  }
}

export default sentryPrepareBoundaryScope;
