import * as Sentry from "@sentry/react-native";

import {
  CaptureException,
  CaptureMessage,
} from "@infrastructure/monitoring/types";

import { buildCaptureOptions, isExpectedError } from "./errorDetails";

function sentryCaptureException(...params: Parameters<CaptureException>) {
  if (isExpectedError(params[0])) {
    return;
  }

  Sentry.captureException(params[0], buildCaptureOptions(params[0], params[1]));
}

function sentryCaptureMessage(...params: Parameters<CaptureMessage>) {
  Sentry.captureMessage(params[0], { extra: params[1] });
}

export { sentryCaptureException, sentryCaptureMessage };
