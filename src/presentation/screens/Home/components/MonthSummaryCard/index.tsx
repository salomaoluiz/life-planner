import { View } from "react-native";

import { AmountText, Card, ErrorState, MetricBlock, Text } from "@components";
import Skeleton from "@components/Skeleton";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import { useTranslation } from "@presentation/i18n";
import { BlockState } from "@screens/Home/hooks/useHomeViewModel";
import MonthSummaryUIModel from "@screens/Home/models/MonthSummaryUIModel";

import useStyles from "./styles";

interface Props {
  fill?: boolean;
  onPress: () => void;
  state: BlockState<MonthSummaryUIModel>;
}

function MonthSummaryCard({ fill, onPress, state }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();

  if (state.isLoading) {
    return <Skeleton.Card testID="home-summary-loading" />;
  }

  if (state.isError || !state.data) {
    return (
      <ErrorState
        message={t("common.errors.generic")}
        onRetry={state.onRetry}
        retryLabel={t("common.actions.tryAgain")}
        testID="home-summary-error"
      />
    );
  }

  const { data } = state;

  return (
    <Card fill={fill} onPress={onPress} testID="home-summary">
      <Text.Overline
        value={t("home.summary.title", { month: data.monthName })}
      />
      <AmountText
        currency={DEFAULT_CURRENCY}
        size="display"
        testID="home-summary-balance"
        type={data.balanceType}
        value={data.balanceValue}
      />
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <MetricBlock
            label={t("home.summary.income")}
            trend="income"
            value={
              <AmountText
                currency={DEFAULT_CURRENCY}
                size="body"
                tone="income"
                value={data.income}
              />
            }
          />
        </View>
        <View style={styles.metric}>
          <MetricBlock
            label={t("home.summary.expenses")}
            trend="expense"
            value={
              <AmountText
                currency={DEFAULT_CURRENCY}
                size="body"
                tone="expense"
                value={data.expense}
              />
            }
          />
        </View>
      </View>
    </Card>
  );
}

export default MonthSummaryCard;
