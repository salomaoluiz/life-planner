import type { Scope } from "@sentry/react-native";
import React from "react";

import {
  sentryAddBreadcrumb,
  sentryCaptureException,
  sentryCaptureMessage,
  SentryErrorBoundary,
  sentryInitialize,
  sentryNavigationIntegration,
  sentryPrepareBoundaryScope,
  sentrySetContext,
  sentrySetTag,
  sentrySetUser,
  SentryWrapper,
} from "./sentry";
import {
  AddBreadcrumb,
  CaptureException,
  CaptureMessage,
  ErrorBoundaryProps,
  SetContext,
  SetTag,
  SetUser,
} from "./types";

function addBreadcrumb(...params: Parameters<AddBreadcrumb>) {
  sentryAddBreadcrumb(params[0]);
}

function beforeCaptureBoundary(scope: Scope, error: unknown) {
  sentryPrepareBoundaryScope(scope, error);
}

function captureException(...params: Parameters<CaptureException>) {
  sentryCaptureException(params[0], params[1]);
}

function captureMessage(...params: Parameters<CaptureMessage>) {
  sentryCaptureMessage(params[0], params[1]);
}

function ErrorBoundary({ children, FallbackComponent }: ErrorBoundaryProps) {
  return (
    <SentryErrorBoundary
      beforeCapture={beforeCaptureBoundary}
      FallbackComponent={FallbackComponent}
    >
      {children}
    </SentryErrorBoundary>
  );
}

function initializeMonitoring() {
  sentryInitialize();
}

function MonitoringWrapper(children: React.ComponentType) {
  return SentryWrapper(children);
}

function setContext(...params: Parameters<SetContext>) {
  sentrySetContext(...params);
}

function setTag(...params: Parameters<SetTag>) {
  sentrySetTag(...params);
}

function setUser(data: Parameters<SetUser>[0]) {
  sentrySetUser(data);
}

const navigationIntegration = sentryNavigationIntegration();

export {
  addBreadcrumb,
  captureException,
  captureMessage,
  ErrorBoundary,
  initializeMonitoring,
  MonitoringWrapper,
  navigationIntegration,
  setContext,
  setTag,
  setUser,
};
