import { View } from "react-native";

import { Button, Card, Text } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { InvestmentIncomeSuggestion } from "@domain/entities/investment/InvestmentEntities";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { IncomeSuggestionActions } from "@screens/Investment/Income/hooks/useIncomeSuggestionActions";
import {
  formatDay,
  formatMoney,
  formatQuantity,
  formatUnitPrice,
} from "@screens/Investment/models/format";
import investmentTestIds from "@screens/Investment/testIds";

const ids = investmentTestIds.suggestions;

interface Props {
  actions: IncomeSuggestionActions;
  suggestion: InvestmentIncomeSuggestion;
  // Today as `YYYY-MM-DD`, to flag a payment date that already passed (FR 31).
  today: string;
}

// One announced income: the estimate, the dates and Recusar / Editar / Aprovar (the design's suggestion card).
function SuggestionCard({ actions, suggestion, today }: Props) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { spacing } = useKitTheme();
  const rate = Number(suggestion.withholdingRate);
  const taxed = rate > 0;
  const past = !!suggestion.paymentDate && suggestion.paymentDate < today;

  return (
    <Card testID={`${ids.row}-${suggestion.id}`}>
      <View style={{ gap: spacing.sm }}>
        <View
          style={{
            flexDirection: "row",
            gap: spacing.sm,
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text.BodyStrong
              value={`${suggestion.ticker} · ${t(`investment.income.types.${suggestion.type}`)}`}
            />
            <Text.Caption
              tone="secondary"
              value={t("investment.suggestions.perUnit", {
                quantity: formatQuantity(suggestion.quantity, localeTag),
                value: formatUnitPrice(
                  suggestion.amountPerUnit,
                  suggestion.currency,
                  localeTag,
                  2,
                ),
              })}
            />
            <Text.Caption
              tone="secondary"
              value={[
                t("investment.suggestions.exDate", {
                  date: formatDay(suggestion.exDate, localeTag),
                }),
                suggestion.paymentDate
                  ? t("investment.suggestions.paymentDate", {
                      date: formatDay(suggestion.paymentDate, localeTag),
                    })
                  : t("investment.suggestions.noPaymentDate"),
              ].join(" · ")}
            />
          </View>
          <View style={{ alignItems: "flex-end", gap: spacing.xs }}>
            <Text.BodyStrong
              tabular
              tone="income"
              value={formatMoney(
                taxed ? suggestion.estimatedNet : suggestion.estimatedGross,
                suggestion.currency,
                localeTag,
              )}
            />
            <Text.Caption
              tone="secondary"
              value={
                taxed
                  ? t("investment.suggestions.estimateNet", {
                      rate: `−${rate * 100}%`,
                    })
                  : t("investment.suggestions.estimateGross")
              }
            />
          </View>
        </View>
        {past ? (
          <Text.Caption
            testID={ids.pastHint}
            tone="warning"
            value={t("investment.suggestions.pastPayment")}
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

export default SuggestionCard;
