import { FallbackRender } from "@sentry/react";
import { ErrorBoundary, type Scope } from "@sentry/react-native";
import React from "react";

import { ErrorBoundaryProps } from "@infrastructure/monitoring/types";

function SentryErrorBoundary(
  props: ErrorBoundaryProps & {
    beforeCapture: (scope: Scope, error: unknown) => void;
  },
) {
  const { beforeCapture, children, FallbackComponent } = props;

  function FallbackRender({
    error,
    resetError,
  }: Parameters<FallbackRender>[0]) {
    return <FallbackComponent error={error} retry={resetError} />;
  }

  function handleBeforeCapture(scope: Scope, error: unknown) {
    beforeCapture(scope, error);
  }

  return (
    <ErrorBoundary
      beforeCapture={handleBeforeCapture}
      fallback={FallbackRender}
    >
      {children}
    </ErrorBoundary>
  );
}

export default SentryErrorBoundary;
