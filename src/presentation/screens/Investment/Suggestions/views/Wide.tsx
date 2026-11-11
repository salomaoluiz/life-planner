import { View } from "react-native";

import {
  AdaptiveViewProps,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Screen,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useTranslation } from "@presentation/i18n";
import { INVESTMENT_MAX_WIDTH } from "@screens/Investment/constants";
import SuggestionCard from "@screens/Investment/Income/components/SuggestionCard";
import investmentTestIds from "@screens/Investment/testIds";

import { SuggestionsVM } from "../hooks";

const ids = investmentTestIds.suggestions;

function Wide({ vm }: AdaptiveViewProps<SuggestionsVM>) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();

  function renderBody() {
    if (vm.errorMessage) {
      return (
        <ErrorState
          message={vm.errorMessage}
          onRetry={vm.onRetry}
          retryLabel={t("common.actions.tryAgain")}
        />
      );
    }

    if (vm.isLoading) {
      return (
        <View>
          <Skeleton.ListItem />
          <Skeleton.ListItem />
        </View>
      );
    }

    if (vm.isEmpty) {
      return (
        <EmptyState
          icon="cash-plus"
          message={t("investment.suggestions.empty")}
          testID={ids.empty}
          title={t("investment.suggestions.title")}
        />
      );
    }

    return (
      <View style={{ gap: spacing.sm }}>
        {vm.items.map((suggestion) => (
          <SuggestionCard
            actions={vm.actions}
            key={suggestion.id}
            suggestion={suggestion}
            today={vm.today}
          />
        ))}
        {vm.actions.failure ? (
          <Text.Caption
            tone="expense"
            value={t(vm.actions.failure.key, vm.actions.failure.params)}
          />
        ) : null}
      </View>
    );
  }

  return (
    <Screen maxWidth={INVESTMENT_MAX_WIDTH} scroll testID={ids.screen}>
      <View style={{ gap: spacing.md }}>
        <Button.Ghost
          icon="arrow-left"
          inline
          label={t("investment.detail.back")}
          onPress={vm.onBack}
          testID={ids.back}
        />
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            gap: spacing.sm,
          }}
        >
          <Text.Title value={t("investment.suggestions.title")} />
          {vm.count > 0 ? (
            <Badge label={String(vm.count)} tone="accent" />
          ) : null}
        </View>
        <Text.Caption
          tone="secondary"
          value={t("investment.suggestions.subtitle")}
        />
        {renderBody()}
      </View>
    </Screen>
  );
}

export default Wide;
