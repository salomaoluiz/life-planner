import {
  sentryInitialize,
  sentryAddBreadcrumb,
  sentryCaptureException,
  sentryCaptureMessage,
  SentryWrapper,
  sentryNavigationIntegration,
  SentryErrorBoundary,
  sentrySetContext,
  sentrySetTag,
  sentrySetUser,
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
import React from "react";
import { GenericError } from "@domain/entities/errors";

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

function setContext(...params: Parameters<SetContext>) {
  sentrySetContext(...params);
}

function setTag(...params: Parameters<SetTag>) {
  sentrySetTag(...params);
}

function setUser(data: Parameters<SetUser>[0]) {
  sentrySetUser(data);
}

function MonitoringWrapper(children: React.ComponentType) {
  return SentryWrapper(children);
}

function beforeCaptureBoundary(_: unknown, error: GenericError) {
  setContext("error-boundary-context", error.context);
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

const navigationIntegration = sentryNavigationIntegration();

export {
  initializeMonitoring,
  addBreadcrumb,
  captureException,
  captureMessage,
  MonitoringWrapper,
  navigationIntegration,
  ErrorBoundary,
  setContext,
  setTag,
  setUser,
};
