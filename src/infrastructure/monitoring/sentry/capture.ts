import * as Sentry from "@sentry/react-native";
import {
  CaptureException,
  CaptureMessage,
} from "@infrastructure/monitoring/types";

const sentryCaptureException: CaptureException = (
  exception: unknown,
  extra,
) => {
  Sentry.captureException(exception, { extra });
};

const sentryCaptureMessage: CaptureMessage = (message: string, extra) => {
  Sentry.captureMessage(message, { extra });
};

export { sentryCaptureException, sentryCaptureMessage };
