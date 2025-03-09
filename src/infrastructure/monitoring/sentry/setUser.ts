import { SetUser } from "@infrastructure/monitoring/types";
import * as Sentry from "@sentry/react-native";

function sentrySetUser(data: Parameters<SetUser>[0]) {
  Sentry.setUser({
    id: data.id,
  });
}

export default sentrySetUser;
