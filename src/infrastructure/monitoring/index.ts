import {
  sentryInitialize,
  sentryAddBreadcrumb,
  sentryCaptureException,
  sentryCaptureMessage,
  SentryWrapper,
  sentryNavigationIntegration,
} from "./sentry";
import { AddBreadcrumb, CaptureException, CaptureMessage } from "./types";
import React from "react";

const initializeMonitoring = () => {
  sentryInitialize();
};

const addBreadcrumb: AddBreadcrumb = (props) => {
  sentryAddBreadcrumb(props);
};

const captureException: CaptureException = (exception, extra) => {
  sentryCaptureException(exception, extra);
};

const captureMessage: CaptureMessage = (message, extra) => {
  sentryCaptureMessage(message, extra);
};

const MonitoringWrapper = (children: React.ComponentType) =>
  SentryWrapper(children);

const navigationIntegration = sentryNavigationIntegration();

export {
  initializeMonitoring,
  addBreadcrumb,
  captureException,
  captureMessage,
  MonitoringWrapper,
  navigationIntegration,
};
