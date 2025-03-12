import * as Sentry from "@sentry/react-native";

import { AddBreadcrumbProps } from "@infrastructure/monitoring/types";

function addSentryBreadcrumb({
  category,
  data,
  level,
  message,
}: AddBreadcrumbProps) {
  Sentry.addBreadcrumb({ category, data, level, message });
}

export default addSentryBreadcrumb;
