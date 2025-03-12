import * as Sentry from "@sentry/react-native";

import { SetContext } from "@infrastructure/monitoring/types";

function sentrySetContext(...params: Parameters<SetContext>) {
  Sentry.setContext(params[0], params[1]);
}

export default sentrySetContext;
