import { AddBreadcrumbProps } from "@infrastructure/monitoring/types";
import * as Sentry from "@sentry/react-native";

function addSentryBreadcrumb({
  category,
  level,
  data,
  message,
}: AddBreadcrumbProps) {
  Sentry.addBreadcrumb({ category, data, message, level });
}

export default addSentryBreadcrumb;
