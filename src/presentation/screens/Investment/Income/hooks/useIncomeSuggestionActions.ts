import { useEffect } from "react";

import { useCases } from "@application/useCases";
import { InvestmentIncomeSuggestion } from "@domain/entities/investment/InvestmentEntities";
import { useMutation } from "@infrastructure/fetcher";
import { useLocaleTag } from "@presentation/i18n";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { formatDay } from "@screens/Investment/models/format";
import getInvestmentErrorMessage from "@screens/Investment/utils/investmentErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

export type IncomeSuggestionActions = ReturnType<
  typeof useIncomeSuggestionActions
>;

export default useIncomeSuggestionActions;

// Spec 107 FR 29-31: Aprovar creates the income at once when it can; otherwise (or on Editar) it opens the modal
// prefilled with the suggestion. Recusar never comes back.
function useIncomeSuggestionActions() {
  const { openModal } = useModalNavigation();
  const localeTag = useLocaleTag();
  const approve = useMutation({
    cacheKey: [useCases.approveInvestmentIncomeSuggestionUseCase.uniqueName],
    fetch: useCases.approveInvestmentIncomeSuggestionUseCase.execute,
  });
  const reject = useMutation({
    cacheKey: [useCases.rejectInvestmentIncomeSuggestionUseCase.uniqueName],
    fetch: useCases.rejectInvestmentIncomeSuggestionUseCase.execute,
  });

  useEffect(() => {
    if (approve.status === "success" || reject.status === "success") {
      void invalidateInvestments();
    }
  }, [approve.status, reject.status]);

  function onEdit(suggestion: InvestmentIncomeSuggestion) {
    openModal("investment_income", {
      assetId: suggestion.assetId,
      suggestionId: suggestion.id,
    });
  }

  return {
    failure: getInvestmentErrorMessage(approve.error ?? reject.error, (day) =>
      formatDay(day, localeTag),
    ),
    isBusy: approve.isFetching || reject.isFetching,
    onApprove(suggestion: InvestmentIncomeSuggestion) {
      if (suggestion.canApproveDirectly) {
        approve.mutate({ id: suggestion.id });
      } else {
        onEdit(suggestion);
      }
    },
    onEdit,
    onReject: (suggestion: InvestmentIncomeSuggestion) =>
      reject.mutate(suggestion.id),
  };
}
