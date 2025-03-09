import { ErrorBoundary } from "@sentry/react-native";
import { FallbackRender } from "@sentry/react";

import React from "react";
import { ErrorBoundaryProps } from "@infrastructure/monitoring/types";
import { GenericError } from "@domain/entities/errors";

function SentryErrorBoundary(props: ErrorBoundaryProps) {
  const { children, FallbackComponent, beforeCapture } = props;

  function FallbackRender({
    error,
    resetError,
  }: Parameters<FallbackRender>[0]) {
    return <FallbackComponent retry={resetError} error={error} />;
  }

  const handleBeforeCapture = (scope: unknown, error: unknown) => {
    if (error instanceof GenericError) {
      beforeCapture(scope, error);
    }
  };

  return (
    <ErrorBoundary
      fallback={FallbackRender}
      beforeCapture={handleBeforeCapture}
    >
      {children}
    </ErrorBoundary>
  );
}

export default SentryErrorBoundary;
