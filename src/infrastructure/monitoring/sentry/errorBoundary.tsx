import { ErrorBoundary } from "@sentry/react-native";
import { FallbackRender } from "@sentry/react";

import React from "react";
import { ErrorBoundaryProps } from "@infrastructure/monitoring/types";

function SentryErrorBoundary(props: ErrorBoundaryProps) {
  const { children, FallbackComponent } = props;

  function FallbackRender({
    error,
    resetError,
  }: Parameters<FallbackRender>[0]) {
    return <FallbackComponent retry={resetError} error={error} />;
  }

  return <ErrorBoundary fallback={FallbackRender}>{children}</ErrorBoundary>;
}

export default SentryErrorBoundary;
