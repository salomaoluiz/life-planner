import {
  sentryInitialize,
  sentryAddBreadcrumb,
  sentryCaptureException,
  sentryCaptureMessage,
  SentryWrapper,
  sentryNavigationIntegration,
  SentryErrorBoundary,
} from "./sentry";
import {
  AddBreadcrumb,
  CaptureException,
  CaptureMessage,
  ErrorBoundaryProps,
} from "./types";
import React from "react";

function initializeMonitoring() {
  sentryInitialize();
}

function addBreadcrumb(...params: Parameters<AddBreadcrumb>) {
  sentryAddBreadcrumb(params[0]);
}

function captureException(...params: Parameters<CaptureException>) {
  sentryCaptureException(params[0], params[1]);
}

function captureMessage(...params: Parameters<CaptureMessage>) {
  sentryCaptureMessage(params[0], params[1]);
}

function MonitoringWrapper(children: React.ComponentType) {
  return SentryWrapper(children);
}

function ErrorBoundary({ children, FallbackComponent }: ErrorBoundaryProps) {
  return (
    <SentryErrorBoundary FallbackComponent={FallbackComponent}>
      {children}
    </SentryErrorBoundary>
  );
}

const navigationIntegration = sentryNavigationIntegration();

export {
  initializeMonitoring,
  addBreadcrumb,
  captureException,
  captureMessage,
  MonitoringWrapper,
  navigationIntegration,
  ErrorBoundary,
};
