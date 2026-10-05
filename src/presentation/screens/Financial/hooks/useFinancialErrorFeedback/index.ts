import { router } from "expo-router";
import { useEffect } from "react";

import {
  AccountHasTransactions,
  CategoryHasTransactions,
  FinancialNotFound,
  FinancialOwnerNotAllowed,
} from "@domain/entities/errors";
import { useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import {
  FeedbackActions,
  FeedbackNavigationTypes,
} from "@screens/Feedback/BusinessFeedback/actions/types";
import { FeedbackType } from "@screens/Feedback/BusinessFeedback/types";
import { createFeedbackRouteEncoded } from "@screens/Feedback/BusinessFeedback/utils";

function getMessageKey(error: unknown): TranslationKeys | undefined {
  if (error instanceof AccountHasTransactions) {
    return "financial.accounts.errors.hasTransactions";
  }

  if (error instanceof CategoryHasTransactions) {
    return "financial.categories.errors.hasTransactions";
  }

  if (error instanceof FinancialNotFound) {
    return "financial.errors.notFound";
  }

  if (error instanceof FinancialOwnerNotAllowed) {
    return "financial.errors.ownerNotAllowed";
  }

  return undefined;
}

// Shows the business-feedback screen for the errors the finance API can answer.
function useFinancialErrorFeedback(error: unknown) {
  const { t } = useTranslation();

  useEffect(() => {
    const messageKey = getMessageKey(error);

    if (!messageKey) {
      return;
    }

    async function showFeedback(key: TranslationKeys) {
      const goBack = {
        action: FeedbackActions.NAVIGATION,
        type: FeedbackNavigationTypes.GO_BACK,
      } as const;

      const encodedRoute = await createFeedbackRouteEncoded({
        closeButton: goBack,
        message: t(key),
        primaryButton: { ...goBack, label: t("financial.errors.close") },
        title: t("financial.errors.title"),
        type: FeedbackType.Error,
      });

      router.push({
        params: encodedRoute,
        pathname: "/business_feedback",
      });
    }

    showFeedback(messageKey);
  }, [error]);
}

export default useFinancialErrorFeedback;
