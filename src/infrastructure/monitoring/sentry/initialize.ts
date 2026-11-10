import * as Sentry from "@sentry/react-native";
import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";

import { getAppInfo } from "@infrastructure/appInfo";

import { isExpectedError } from "./errorDetails";
import sentryNavigationIntegration from "./navigationIntegration";
import { scrubEvent } from "./scrub";

function isWarningOrAbove(breadcrumb: Sentry.Breadcrumb) {
  return breadcrumb.level === "warning" || breadcrumb.level === "error";
}

// Console breadcrumbs only from warning up (spec 106); every URL and payload goes through the scrubber.
function scrubBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  if (breadcrumb.category === "console" && !isWarningOrAbove(breadcrumb)) {
    return null;
  }

  return scrubEvent({ breadcrumbs: [breadcrumb] })
    .breadcrumbs?.[0] as Sentry.Breadcrumb;
}

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
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? envs.EXPO_PUBLIC_API_URL;

  return Sentry.init({
    beforeBreadcrumb: (breadcrumb) => scrubBreadcrumb(breadcrumb),
    beforeSend: (event, hint) =>
      isExpectedError(hint?.originalException) ? null : scrubEvent(event),
    dsn: sentryDsn,
    ...(Platform.OS === "web" ? { dist: "web" } : {}),
    enabled: !__DEV__ && sentryEnabled === "true",
    enableNativeFramesTracking: !isRunningInExpoGo(),
    environment: sentryEnvironment,
    integrations: [navigationIntegration],
    release: `life-planner@${getAppInfo().version}`,
    sendDefaultPii: false,
    tracePropagationTargets: apiUrl ? [apiUrl] : [],
    tracesSampleRate: toSampleRate(sentryTracesSampler),
  });
}

// A fraction between 0 and 1 ("0.2" = 20%): parseInt read "0.2" as 0. Anything unreadable turns tracing off.
function toSampleRate(value: string | undefined) {
  const rate = Number.parseFloat(value ?? "0");

  return Number.isFinite(rate) ? Math.min(Math.max(rate, 0), 1) : 0;
}

export default sentryInitialize;
