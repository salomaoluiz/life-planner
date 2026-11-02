import { Card, ErrorState, Text } from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { BlockState } from "@screens/Home/hooks/useHomeViewModel";
import StockAttentionUIModel from "@screens/Home/models/StockAttentionUIModel";
import homeTestIds from "@screens/Home/testIds";

interface Props {
  fill?: boolean;
  state: BlockState<StockAttentionUIModel>;
}

// How many stock items need attention (expired or expiring soon), next to the list of them (spec 062 FR 2).
function StockSummaryCard({ fill, state }: Props) {
  const { t } = useTranslation();

  if (state.isLoading) {
    return <Skeleton.Card testID={homeTestIds.stockAttentionLoading} />;
  }

  if (state.isError || !state.data) {
    return (
      <ErrorState
        message={t("common.errors.generic")}
        onRetry={state.onRetry}
        retryLabel={t("common.actions.tryAgain")}
        testID={homeTestIds.stockAttentionError}
      />
    );
  }

  const { data } = state;

  return (
    <Card fill={fill} testID={homeTestIds.stockSummary}>
      <Text.Overline value={t("home.stock.attention")} />
      <Text.Display
        testID={homeTestIds.stockAttentionCount}
        value={t(pluralKey("home.stock.count", data.attentionCount), {
          count: data.attentionCount,
        })}
      />
      <Text.Caption
        value={t("home.stock.inStock", { count: data.totalItems })}
      />
    </Card>
  );
}

export default StockSummaryCard;
