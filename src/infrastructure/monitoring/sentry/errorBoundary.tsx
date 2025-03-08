import { ErrorBoundary } from "@sentry/react";
import React from "react";
import { ErrorBoundaryProps } from "@infrastructure/monitoring/types";

function SentryErrorBoundary(props: ErrorBoundaryProps) {
  const { children, FallbackComponent } = props;
  return (
    <ErrorBoundary
      fallback={({ error }) => <FallbackComponent error={error} />}
    >
      {children}
    </ErrorBoundary>
  );
}

export default SentryErrorBoundary;
