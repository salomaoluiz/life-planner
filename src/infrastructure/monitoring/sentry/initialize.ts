import * as Sentry from "@sentry/react-native";
import { isRunningInExpoGo } from "expo";
import sentryNavigationIntegration from "./navigationIntegration";

const sentryInitialize = () => {
  const envVars = process.env;
  const navigationIntegration = sentryNavigationIntegration();
  return Sentry.init({
    dsn: envVars.EXPO_PUBLIC_SENTRY_DSN,
    environment: envVars.EXPO_PUBLIC_SENTRY_ENVIRONMENT,
    tracesSampleRate: parseInt(
      envVars.EXPO_PUBLIC_SENTRY_TRACES_SAMPLER || "0",
    ),
    enabled: envVars.EXPO_PUBLIC_SENTRY_ENABLED === "true",
    integrations: [navigationIntegration],
    enableNativeFramesTracking: !isRunningInExpoGo(),
  });
};

export default sentryInitialize;
