import * as Sentry from "@sentry/react-native";
import { isRunningInExpoGo } from "expo";

import sentryNavigationIntegration from "./navigationIntegration";

function sentryInitialize() {
  const envs = process.env;

  const sentryDsn =
    process.env.EXPO_PUBLIC_SENTRY_DSN ?? envs.EXPO_PUBLIC_SENTRY_DSN;
  const sentryEnvironment =
    process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT ??
    envs.EXPO_PUBLIC_SENTRY_ENVIRONMENT;
  const sentryTracesSampler =
    process.env.EXPO_PUBLIC_SENTRY_TRACES_SAMPLER ??
    envs.EXPO_PUBLIC_SENTRY_TRACES_SAMPLER;
  const sentryEnabled =
    process.env.EXPO_PUBLIC_SENTRY_ENABLED ?? envs.EXPO_PUBLIC_SENTRY_ENABLED;

  const navigationIntegration = sentryNavigationIntegration();
  return Sentry.init({
    dsn: sentryDsn,
    enabled: !__DEV__ && sentryEnabled === "true",
    enableNativeFramesTracking: !isRunningInExpoGo(),
    environment: sentryEnvironment,
    integrations: [navigationIntegration],
    tracesSampleRate: toSampleRate(sentryTracesSampler),
  });
}

// A fraction between 0 and 1 ("0.2" = 20%): parseInt read "0.2" as 0. Anything unreadable turns tracing off.
function toSampleRate(value: string | undefined) {
  const rate = Number.parseFloat(value ?? "0");

  return Number.isFinite(rate) ? Math.min(Math.max(rate, 0), 1) : 0;
}

export default sentryInitialize;
