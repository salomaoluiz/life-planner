import { View } from "react-native";

import {
  AmountText,
  Highlight,
  HighlightRow,
  MetricBlock,
  Text,
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
}

// Current value, cost and unrealized result, with the quotes footer (spec 109 FR 3-6).
function PortfolioBlock({ data }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { footer } = data;
  const when = footer.when
    ? t(`home.investments.when.${footer.when.kind}`, {
        date: footer.when.date,
        time: footer.when.time,
      })
    : undefined;

  return (
    <View style={styles.block}>
      <View style={styles.stack}>
        <Text.Overline value={t("home.investments.currentValue")} />
        <AmountText
          currency={DEFAULT_CURRENCY}
          size="display"
          testID={homeTestIds.investmentsCurrentValue}
          value={data.currentValueCents}
        />
        <Text.Caption
          tone="secondary"
          value={t("home.investments.consolidated")}
        />
      </View>
      <MetricBlock
        label={t("home.investments.invested")}
        testID={homeTestIds.investmentsInvested}
        value={
          <AmountText
            currency={DEFAULT_CURRENCY}
            size="body"
            value={data.investedCents}
          />
        }
      />
      <HighlightRow
        caption={data.resultPercent}
        testID={homeTestIds.investmentsResult}
        title={t("home.investments.result")}
        tone={data.resultTone}
        value={formatAmount(
          data.resultCents,
          localeTag,
          DEFAULT_CURRENCY,
          data.resultTone === "expense" ? "EXPENSE" : "INCOME",
        )}
      />
      {footer.stale && when ? (
        <Highlight active tone="warning">
          <Text.Caption
            testID={homeTestIds.investmentsQuotesFooter}
            tone="warning"
            value={t("home.investments.stale", { when })}
          />
        </Highlight>
      ) : (
        <Text.Caption
          testID={homeTestIds.investmentsQuotesFooter}
          tone="secondary"
          value={[
            when ? t("home.investments.quotesAsOf", { when }) : undefined,
            footer.manualCount > 0
              ? t(
                  pluralKey("home.investments.manualCount", footer.manualCount),
                  { count: footer.manualCount },
                )
              : undefined,
          ]
            .filter(Boolean)
            .join(" · ")}
        />
      )}
    </View>
  );
}

export default PortfolioBlock;
