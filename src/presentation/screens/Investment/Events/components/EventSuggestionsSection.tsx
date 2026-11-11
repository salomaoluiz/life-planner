import { View } from "react-native";

import { Section, Text } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { InvestmentAssetDetail } from "@domain/entities/investment/InvestmentEntities";
import { useTranslation } from "@presentation/i18n";
import useEventSuggestionActions from "@screens/Investment/Events/hooks/useEventSuggestionActions";
import useEventSuggestions from "@screens/Investment/Events/hooks/useEventSuggestions";
import { hasSellsAfter } from "@screens/Investment/Events/models/eventInfo";
import investmentTestIds from "@screens/Investment/testIds";

import EventSuggestionCard from "./EventSuggestionCard";

const ids = investmentTestIds.suggestions.event;

interface Props {
  asset: InvestmentAssetDetail;
}

// Spec 108 section 8: the "Sugestões" of the asset detail lists the announced events; nothing renders without any.
function EventSuggestionsSection({ asset }: Props) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const actions = useEventSuggestionActions();
  const suggestions = useEventSuggestions(asset.id);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Section
      testID={ids.section}
      title={`${t("investment.suggestions.title")} (${suggestions.length})`}
    >
      <View style={{ gap: spacing.sm }}>
        <Text.Caption
          tone="secondary"
          value={t("investment.suggestions.eventsSubtitle")}
        />
        {suggestions.map((suggestion) => (
          <EventSuggestionCard
            actions={actions}
            key={suggestion.id}
            pastSells={hasSellsAfter(asset.operations, suggestion.date)}
            suggestion={suggestion}
          />
        ))}
        {actions.failure ? (
          <Text.Caption
            tone="expense"
            value={t(actions.failure.key, actions.failure.params)}
          />
        ) : null}
      </View>
    </Section>
  );
}

export default EventSuggestionsSection;
