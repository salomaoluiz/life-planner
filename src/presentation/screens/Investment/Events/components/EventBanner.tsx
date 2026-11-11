import { StatusBanner } from "@components";
import { InvestmentAssetDetail } from "@domain/entities/investment/InvestmentEntities";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import useEventSuggestionActions from "@screens/Investment/Events/hooks/useEventSuggestionActions";
import useEventSuggestions from "@screens/Investment/Events/hooks/useEventSuggestions";
import { firstSuggestion } from "@screens/Investment/Events/models/eventInfo";
import { formatDay } from "@screens/Investment/models/format";
import investmentTestIds from "@screens/Investment/testIds";

const ids = investmentTestIds.event;

interface Props {
  asset: InvestmentAssetDetail;
}

// Spec 108 FR 31: while an event is pending the quote already reflects it, so the value may be wrong until the owner
// decides. "Ver sugestão" opens the oldest pending suggestion in the event modal (the screen has no scroll anchors).
function EventBanner({ asset }: Props) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const actions = useEventSuggestionActions();
  const suggestion = firstSuggestion(useEventSuggestions(asset.id));

  if (!suggestion) {
    return null;
  }

  return (
    <StatusBanner
      actionLabel={t("investment.event.seeSuggestion")}
      icon="alert-outline"
      message={t("investment.event.pendingBanner", {
        date: formatDay(suggestion.date, localeTag),
        type: t(`investment.operation.${suggestion.type}`),
      })}
      onAction={() => actions.onEdit(suggestion)}
      testID={ids.banner}
    />
  );
}

export default EventBanner;
