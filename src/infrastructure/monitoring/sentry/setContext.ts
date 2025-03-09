import { SetContext } from "@infrastructure/monitoring/types";
import * as Sentry from "@sentry/react-native";

function sentrySetContext(...params: Parameters<SetContext>) {
  Sentry.setContext(params[0], params[1]);
}

export default sentrySetContext;
