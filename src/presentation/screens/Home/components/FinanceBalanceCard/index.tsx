import { View } from "react-native";

import {
  AmountText,
  Badge,
  Card,
  ErrorState,
  MetricBlock,
  Text,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import Skeleton from "@components/Skeleton";
import {
  CurrencyCode,
  DEFAULT_CURRENCY,
} from "@domain/entities/financial/Currency";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { BlockState } from "@screens/Home/hooks/useHomeViewModel";
import FinanceBalanceUIModel from "@screens/Home/models/FinanceBalanceUIModel";
import homeTestIds from "@screens/Home/testIds";

import useStyles from "./styles";

interface Props {
  // Spec 103: the currency of every figure (BRL when omitted).
  currency?: CurrencyCode;
  fill?: boolean;
  onPress: () => void;
  state: BlockState<FinanceBalanceUIModel>;
}

// The projected balance at the end of the month and what it is made of (spec 062 FR 4-7).
function FinanceBalanceCard({ currency, fill, onPress, state }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();

  if (state.isLoading) {
    return <Skeleton.Card testID={homeTestIds.financeBalanceLoading} />;
  }

  if (state.isError || !state.data) {
    return (
      <ErrorState
        message={t("common.errors.generic")}
        onRetry={state.onRetry}
        retryLabel={t("common.actions.tryAgain")}
        testID={homeTestIds.financeBalanceError}
      />
    );
  }

  const { data } = state;
  const { currentCents, toPayCents, toReceiveCents } = data.breakdown;

  function money(cents: number) {
    return formatAmount(cents, localeTag, currency ?? DEFAULT_CURRENCY);
  }

  return (
    <Card fill={fill} onPress={onPress} testID={homeTestIds.financeBalance}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.title}>
              <Text.Overline
                value={t("home.finance.projectedEnd", {
                  month: data.monthName,
                })}
              />
            </View>
            {data.favoriteName ? (
              <Badge
                icon="star"
                label={data.favoriteName}
                testID={homeTestIds.financeFavoriteBadge}
                tone="warning"
              />
            ) : null}
          </View>
          <AmountText
            currency={currency ?? DEFAULT_CURRENCY}
            size="display"
            testID={homeTestIds.financeProjectedBalance}
            type={data.projectedType}
            value={data.projectedValue}
          />
          <View style={styles.breakdown}>
            <Text.Caption
              value={t("home.finance.breakdown.current", {
                amount: money(currentCents),
              })}
            />
            <Text.Caption
              bold
              tone="income"
              value={formatAmount(
                toReceiveCents,
                localeTag,
                currency ?? DEFAULT_CURRENCY,
                "INCOME",
              )}
            />
            <Text.Caption value={t("home.finance.breakdown.toReceive")} />
            <Text.Caption
              bold
              tone="expense"
              value={formatAmount(
                toPayCents,
                localeTag,
                currency ?? DEFAULT_CURRENCY,
                "EXPENSE",
              )}
            />
            <Text.Caption value={t("home.finance.breakdown.toPay")} />
          </View>
          {data.favoriteName ? (
            <Text.Caption
              testID={homeTestIds.financeTotalOfAccounts}
              tone="secondary"
              value={t("home.finance.totalOfAccounts", {
                amount: money(data.totalProjectedCents),
              })}
            />
          ) : null}
        </View>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <MetricBlock
              label={t("home.finance.income")}
              trend="income"
              value={
                <AmountText
                  currency={currency ?? DEFAULT_CURRENCY}
                  size="body"
                  tone="income"
                  value={data.income}
                />
              }
            />
          </View>
          <View style={styles.metric}>
            <MetricBlock
              label={t("home.finance.expenses")}
              trend="expense"
              value={
                <AmountText
                  currency={currency ?? DEFAULT_CURRENCY}
                  size="body"
                  tone="expense"
                  value={data.expense}
                />
              }
            />
          </View>
        </View>
      </View>
    </Card>
  );
}

export default FinanceBalanceCard;
