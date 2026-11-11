import { View } from "react-native";

import { Button, Card, Icon, Text, useDensity } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { InvestmentEventSuggestion } from "@domain/entities/investment/InvestmentEntities";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { EventSuggestionActions } from "@screens/Investment/Events/hooks/useEventSuggestionActions";
import {
  addedShares,
  bonusEvery,
  eventHeadline,
} from "@screens/Investment/Events/models/eventInfo";
import {
  formatDay,
  formatQuantity,
  formatUnitPrice,
} from "@screens/Investment/models/format";
import investmentTestIds from "@screens/Investment/testIds";

const ids = investmentTestIds.suggestions.event;

interface Props {
  actions: EventSuggestionActions;
  // The asset has sells dated after the data-com: approving recalculates them.
  pastSells: boolean;
  suggestion: InvestmentEventSuggestion;
}

// One announced event (spec 108 section 8): what it is, the data-com, the position after it and
// Recusar / Editar / Aprovar (the design's suggestion card; 44 px buttons come from the kit).
function EventSuggestionCard({ actions, pastSells, suggestion }: Props) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { colors, spacing } = useKitTheme();
  const compact = useDensity().density === "compact";
  const headline = eventHeadline(
    suggestion,
    t(`investment.operation.${suggestion.type}`),
  );
  const bonus = suggestion.bonusPercent !== undefined;
  const details = [
    t("investment.event.recordLine", {
      date: formatDay(suggestion.date, localeTag),
    }),
    suggestion.bonusUnitCost
      ? t("investment.event.unitCostLine", {
          cost: formatUnitPrice(
            suggestion.bonusUnitCost,
            suggestion.currency,
            localeTag,
            2,
          ),
        })
      : undefined,
    t("investment.event.sharesOnRecord", {
      quantity: formatQuantity(suggestion.quantityBefore, localeTag),
    }),
  ].filter((part): part is string => part !== undefined);
  const added = addedShares(
    suggestion.quantityBefore,
    suggestion.quantityAfter,
  );
  const afterDetail = [
    Number(added) > 0
      ? t("investment.event.afterAdded", {
          added: formatQuantity(added, localeTag),
        })
      : undefined,
    Number(suggestion.fractionQuantity) > 0
      ? t("investment.event.afterFraction", {
          fraction: formatQuantity(suggestion.fractionQuantity, localeTag),
        })
      : undefined,
  ].filter((part): part is string => part !== undefined);

  return (
    <Card testID={`${ids.row}-${suggestion.id}`}>
      <View style={{ gap: spacing.sm }}>
        <View
          style={{
            alignItems: compact ? "stretch" : "center",
            flexDirection: compact ? "column" : "row",
            gap: spacing.md,
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, flexDirection: "row", gap: spacing.sm }}>
            <Icon color={colors.accentText} name="plus-box-outline" size={22} />
            <View style={{ flex: 1, gap: spacing.xxs }}>
              <Text.BodyStrong
                value={`${suggestion.ticker} · ${t(headline.key, headline.params)}`}
              />
              {bonus ? (
                <Text.Caption
                  tone="secondary"
                  value={t("investment.event.bonusPercentHint", {
                    n: bonusEvery(suggestion.bonusPercent ?? ""),
                  })}
                />
              ) : null}
              <Text.Caption tone="secondary" value={details.join(" · ")} />
            </View>
          </View>
          <View
            style={{
              alignItems: compact ? "flex-start" : "flex-end",
              gap: spacing.xxs,
            }}
          >
            <Text.Caption
              tone="secondary"
              value={t("investment.event.afterLabel")}
            />
            <Text.BodyStrong
              tabular
              value={t("investment.event.afterValue", {
                price: suggestion.averagePriceAfter
                  ? formatUnitPrice(
                      suggestion.averagePriceAfter,
                      suggestion.currency,
                      localeTag,
                      2,
                    )
                  : "—",
                quantity: formatQuantity(suggestion.quantityAfter, localeTag),
              })}
            />
            {afterDetail.length > 0 ? (
              <Text.Caption tone="secondary" value={afterDetail.join(" · ")} />
            ) : null}
          </View>
        </View>
        {pastSells ? (
          <Text.Caption
            testID={ids.pastHint}
            tone="warning"
            value={t("investment.suggestions.eventPastSells")}
          />
        ) : null}
        <View
          style={{
            flexDirection: "row",
            gap: spacing.sm,
            justifyContent: "flex-end",
          }}
        >
          <Button.Ghost
            disabled={actions.isBusy}
            label={t("investment.suggestions.reject")}
            onPress={() => actions.onReject(suggestion)}
            testID={`${ids.reject}-${suggestion.id}`}
            tone="expense"
          />
          <Button.Secondary
            disabled={actions.isBusy}
            label={t("investment.suggestions.edit")}
            onPress={() => actions.onEdit(suggestion)}
            testID={`${ids.edit}-${suggestion.id}`}
          />
          <Button.Primary
            disabled={actions.isBusy}
            label={t("investment.suggestions.approve")}
            onPress={() => actions.onApprove(suggestion)}
            testID={`${ids.approve}-${suggestion.id}`}
          />
        </View>
      </View>
    </Card>
  );
}

export default EventSuggestionCard;
