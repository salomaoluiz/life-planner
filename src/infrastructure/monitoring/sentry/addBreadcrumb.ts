import { AddBreadcrumb } from "@infrastructure/monitoring/types";
import * as Sentry from "@sentry/react-native";

const addSentryBreadcrumb: AddBreadcrumb = ({
  category,
  level,
  data,
  message,
}) => {
  Sentry.addBreadcrumb({ category, data, message, level });
};

export default addSentryBreadcrumb;
