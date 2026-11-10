import * as Sentry from "@sentry/react-native";

import { SetUser } from "@infrastructure/monitoring/types";

function sentrySetUser(data: Parameters<SetUser>[0]) {
  Sentry.setUser(data ? { id: data.id } : null);
}

export default sentrySetUser;
