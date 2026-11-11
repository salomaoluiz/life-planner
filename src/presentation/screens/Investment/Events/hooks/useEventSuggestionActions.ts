import { useEffect } from "react";

import { useCases } from "@application/useCases";
import { InvestmentEventSuggestion } from "@domain/entities/investment/InvestmentEntities";
import { useMutation } from "@infrastructure/fetcher";
import { useLocaleTag } from "@presentation/i18n";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { formatDay } from "@screens/Investment/models/format";
import getInvestmentErrorMessage from "@screens/Investment/utils/investmentErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

export type EventSuggestionActions = ReturnType<
  typeof useEventSuggestionActions
>;

export default useEventSuggestionActions;

// Spec 108 FR 28-29: Aprovar applies the event as announced (it never lacks a field); Editar opens the event modal
// prefilled with the suggestion; Recusar never comes back. A 422 (no position, negative position) shows inline and
// the suggestion stays.
function useEventSuggestionActions() {
  const { openModal } = useModalNavigation();
  const localeTag = useLocaleTag();
  const approve = useMutation({
    cacheKey: [useCases.approveInvestmentEventSuggestionUseCase.uniqueName],
    fetch: useCases.approveInvestmentEventSuggestionUseCase.execute,
  });
  const reject = useMutation({
    cacheKey: [useCases.rejectInvestmentEventSuggestionUseCase.uniqueName],
    fetch: useCases.rejectInvestmentEventSuggestionUseCase.execute,
  });

  useEffect(() => {
    if (approve.status === "success" || reject.status === "success") {
      void invalidateInvestments();
    }
  }, [approve.status, reject.status]);

  function onEdit(suggestion: InvestmentEventSuggestion) {
    openModal("investment_operation", {
      assetId: suggestion.assetId,
      suggestionId: suggestion.id,
    });
  }

  return {
    failure: getInvestmentErrorMessage(approve.error ?? reject.error, (day) =>
      formatDay(day, localeTag),
    ),
    isBusy: approve.isFetching || reject.isFetching,
    onApprove: (suggestion: InvestmentEventSuggestion) =>
      approve.mutate({ id: suggestion.id }),
    onEdit,
    onReject: (suggestion: InvestmentEventSuggestion) =>
      reject.mutate(suggestion.id),
  };
}
