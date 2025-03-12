import * as Sentry from "@sentry/react-native";
import { isRunningInExpoGo } from "expo";

import { NavigationIntegration } from "@infrastructure/monitoring/types";

let navigationIntegration: NavigationIntegration;

function getNavigationIntegration() {
  if (!navigationIntegration) {
    navigationIntegration = Sentry.reactNavigationIntegration({
      enableTimeToInitialDisplay: !isRunningInExpoGo(),
    });
  }

  return navigationIntegration;
}

export default getNavigationIntegration;
