import * as Sentry from "@sentry/react-native";
import React from "react";

const SentryWrapper = (child: React.ComponentType) => Sentry.wrap(child);

export default SentryWrapper;
