import * as Sentry from "@sentry/react-native";

import { SetUser } from "@infrastructure/monitoring/types";

function sentrySetUser(data: Parameters<SetUser>[0]) {
  Sentry.setUser({
    id: data.id,
  });
}

export default sentrySetUser;
