import * as Sentry from "@sentry/react-native";

import {
  CaptureException,
  CaptureMessage,
} from "@infrastructure/monitoring/types";

function sentryCaptureException(...params: Parameters<CaptureException>) {
  Sentry.captureException(params[0], { extra: params[1] });
}

function sentryCaptureMessage(...params: Parameters<CaptureMessage>) {
  Sentry.captureMessage(params[0], { extra: params[1] });
}

export { sentryCaptureException, sentryCaptureMessage };
