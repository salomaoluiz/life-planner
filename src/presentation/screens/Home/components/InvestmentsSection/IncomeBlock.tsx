import { View } from "react-native";

import {
  AmountText,
  Divider,
  IconTile,
  ListItem,
  Text,
  Touchable,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import InvestmentsSummaryUIModel from "@screens/Home/models/InvestmentsSummaryUIModel";
import homeTestIds from "@screens/Home/testIds";

import useStyles from "./styles";

interface Props {
  data: InvestmentsSummaryUIModel;
  onMaturityPress: (assetId: string) => void;
  onSuggestionsPress: () => void;
}

// Income received in the month, the suggestions to confirm and the next fixed income maturity (FR 8-10).
function IncomeBlock({ data, onMaturityPress, onSuggestionsPress }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { income, maturity } = data;

  return (
    <View style={styles.block}>
      <View style={styles.stack}>
        <Text.Overline
          value={t("home.investments.income", { month: income.monthName })}
        />
        <AmountText
          currency={DEFAULT_CURRENCY}
          size="heading"
          testID={homeTestIds.investmentsIncome}
          tone={income.isEmpty ? "primary" : "income"}
          type={income.isEmpty ? undefined : "INCOME"}
          value={income.totalCents}
        />
        <Text.Caption
          tone="secondary"
          value={
            income.isEmpty
              ? t("home.investments.noIncome")
              : t(pluralKey("home.investments.incomeCount", income.count), {
                  count: income.count,
                })
          }
        />
        {income.pendingSuggestions > 0 ? (
          <Touchable
            accessibilityRole="button"
            onPress={onSuggestionsPress}
            testID={homeTestIds.investmentsSuggestions}
          >
            <Text.Caption
              bold
              value={t(
                pluralKey(
                  "home.investments.suggestions",
                  income.pendingSuggestions,
                ),
                { count: income.pendingSuggestions },
              )}
            />
          </Touchable>
        ) : null}
      </View>
      <Divider />
      <Text.Overline value={t("home.investments.nextMaturity")} />
      {maturity ? (
        <ListItem
          leading={<IconTile name="calendar-month-outline" tone="warning" />}
          onPress={() => onMaturityPress(maturity.assetId)}
          subtitle={
            maturity.days === 0
              ? t("home.investments.dueToday", { date: maturity.dateLabel })
              : t(pluralKey("home.investments.dueIn", maturity.days), {
                  date: maturity.dateLabel,
                  days: maturity.days,
                })
          }
          testID={homeTestIds.investmentsNextMaturity}
          title={maturity.name}
          trailing={
            <View style={styles.end}>
              <Text.BodyStrong
                tabular
                value={formatAmount(
                  maturity.netEstimatedCents,
                  localeTag,
                  maturity.currency,
                )}
              />
              <Text.Caption
                tone="secondary"
                value={t("home.investments.netEstimated")}
              />
            </View>
          }
        />
      ) : (
        <Text.Caption
          tone="secondary"
          value={t("home.investments.noMaturity")}
        />
      )}
    </View>
  );
}

export default IncomeBlock;
