import * as Sentry from "@sentry/react-native";

import { SetTag } from "@infrastructure/monitoring/types";

function sentrySetTag(...params: Parameters<SetTag>) {
  Sentry.setTag(params[0], params[1]);
}

export default sentrySetTag;
