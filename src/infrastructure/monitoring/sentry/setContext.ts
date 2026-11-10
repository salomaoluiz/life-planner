import * as Sentry from "@sentry/react-native";

import { SetContext } from "@infrastructure/monitoring/types";

import { scrub } from "./scrub";

function sentrySetContext(...params: Parameters<SetContext>) {
  Sentry.setContext(params[0], scrub(params[1]));
}

export default sentrySetContext;
