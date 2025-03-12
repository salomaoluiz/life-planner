import { FallbackRender } from "@sentry/react";
import { ErrorBoundary } from "@sentry/react-native";
import React from "react";

import { GenericError } from "@domain/entities/errors";
import { ErrorBoundaryProps } from "@infrastructure/monitoring/types";

function SentryErrorBoundary(
  props: ErrorBoundaryProps & {
    beforeCapture: (scope: unknown, error: GenericError) => void;
  },
) {
  const { beforeCapture, children, FallbackComponent } = props;

  function FallbackRender({
    error,
    resetError,
  }: Parameters<FallbackRender>[0]) {
    return <FallbackComponent error={error} retry={resetError} />;
  }

  function handleBeforeCapture(scope: unknown, error: unknown) {
    if (error instanceof GenericError) {
      beforeCapture(scope, error);
    }
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
