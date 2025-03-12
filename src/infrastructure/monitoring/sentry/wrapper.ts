import * as Sentry from "@sentry/react-native";
import React from "react";

function SentryWrapper(child: React.ComponentType) {
  return Sentry.wrap(child);
}

export default SentryWrapper;
