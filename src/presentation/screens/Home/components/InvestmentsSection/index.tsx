import { View } from "react-native";

import { Card, EmptyState, ErrorState, Touchable } from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import { BlockState } from "@screens/Home/hooks/useHomeViewModel";
import InvestmentsSummaryUIModel from "@screens/Home/models/InvestmentsSummaryUIModel";
import homeTestIds from "@screens/Home/testIds";

import IncomeBlock from "./IncomeBlock";
import PortfolioBlock from "./PortfolioBlock";
import useStyles from "./styles";

interface Props {
  canAddAsset: boolean;
  isSplitLayout: boolean;
  onAddAssetPress: () => void;
  onMaturityPress: (assetId: string) => void;
  onPortfolioPress: () => void;
  onSuggestionsPress: () => void;
  state: BlockState<InvestmentsSummaryUIModel>;
}

// Two cards side by side on wide screens, one compact card otherwise (spec 109 FR 2); the states load and fail alone.
function InvestmentsSection(props: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { state } = props;

  if (state.isLoading) {
    return <Skeleton.Card testID={homeTestIds.investmentsLoading} />;
  }

  if (state.isError || !state.data) {
    return (
      <ErrorState
        message={t("home.investments.error")}
        onRetry={state.onRetry}
        retryLabel={t("common.actions.tryAgain")}
        testID={homeTestIds.investmentsError}
      />
    );
  }

  const { data } = state;

  if (data.isEmpty) {
    return (
      <EmptyState
        actionLabel={
          props.canAddAsset ? t("home.investments.addAsset") : undefined
        }
        icon="chart-line"
        message={t("home.investments.empty.body")}
        onAction={props.canAddAsset ? props.onAddAssetPress : undefined}
        testID={homeTestIds.investmentsEmpty}
        title={t("home.investments.empty.title")}
      />
    );
  }

  const portfolio = <PortfolioBlock data={data} />;
  const income = (
    <IncomeBlock
      data={data}
      onMaturityPress={props.onMaturityPress}
      onSuggestionsPress={props.onSuggestionsPress}
    />
  );

  if (props.isSplitLayout) {
    return (
      <View style={styles.split}>
        <View style={styles.column}>
          <Card
            accessibilityLabel={t("home.investments.openLabel")}
            fill
            onPress={props.onPortfolioPress}
          >
            {portfolio}
          </Card>
        </View>
        <View style={styles.column}>
          <Card fill>{income}</Card>
        </View>
      </View>
    );
  }

  return (
    <Card>
      <View style={styles.root}>
        <Touchable
          accessibilityLabel={t("home.investments.openLabel")}
          accessibilityRole="button"
          onPress={props.onPortfolioPress}
        >
          {portfolio}
        </Touchable>
        {income}
      </View>
    </Card>
  );
}

export default InvestmentsSection;
