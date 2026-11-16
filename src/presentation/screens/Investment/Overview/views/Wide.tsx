import { View } from "react-native";

import {
  AdaptiveViewProps,
  EmptyState,
  ErrorState,
  IconButton,
  ReadOnlyNotice,
  Screen,
  Toast,
} from "@components";
import { useTranslation } from "@presentation/i18n";
import { translateChoices } from "@screens/Financial/models/ownerOptions";
import { INVESTMENT_OVERVIEW_MAX_WIDTH } from "@screens/Investment/constants";
import SectionHeader from "@screens/Investment/Layout/components/SectionHeader";

import AllocationBlock from "../components/AllocationBlock";
import EvolutionBlock from "../components/EvolutionBlock";
import IncomeBlock from "../components/IncomeBlock";
import OverviewToolbar from "../components/OverviewToolbar";
import RankingBlock from "../components/RankingBlock";
import StateBanners from "../components/StateBanners";
import Tiles from "../components/Tiles";
import { InvestmentOverviewVM } from "../hooks";
import useStyles from "../styles";
import overviewTestIds from "../testIds";

function Wide({ vm }: AdaptiveViewProps<InvestmentOverviewVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const ownerName = translateChoices(vm.ownerChoices, t).find(
    (choice) => choice.value === vm.ownerFilter,
  )?.label;

  function renderBody() {
    if (vm.dashboard.status === "error" && !vm.dashboard.data) {
      return (
        <ErrorState
          message={t("investment.overview.error")}
          onRetry={vm.onRetry}
          retryLabel={t("investment.overview.retry")}
          testID={overviewTestIds.errorRetry}
        />
      );
    }

    if (vm.isEmpty) {
      return (
        <EmptyState
          actionLabel={t("investment.overview.emptyAdd")}
          icon="chart-line"
          message={t("investment.overview.emptyDescription")}
          onAction={vm.onAddAsset}
          testID={overviewTestIds.empty}
          title={
            vm.ownerFilter === "ALL" || !ownerName
              ? t("investment.overview.empty")
              : t("investment.overview.emptyOwner", { owner: ownerName })
          }
        />
      );
    }

    return (
      <>
        <StateBanners vm={vm} />
        <Tiles vm={vm} />
        <EvolutionBlock vm={vm} />
        <View style={styles.pairs}>
          <View style={styles.pair}>
            <AllocationBlock vm={vm} />
          </View>
          <View style={styles.pair}>
            <RankingBlock vm={vm} />
          </View>
        </View>
        <IncomeBlock vm={vm} />
      </>
    );
  }

  return (
    <Screen
      maxWidth={INVESTMENT_OVERVIEW_MAX_WIDTH}
      scroll
      testID={overviewTestIds.screen}
    >
      <SectionHeader
        actions={
          vm.readOnlyScope.readOnly ? null : (
            <IconButton
              accessibilityLabel={t("investment.overview.emptyAdd")}
              name="plus"
              onPress={vm.onAddAsset}
            />
          )
        }
        section="overview"
      />
      <View style={styles.blocks}>
        <OverviewToolbar vm={vm} />
        {vm.readOnlyScope.readOnly ? (
          <ReadOnlyNotice message={t("family.archived.banner")} />
        ) : null}
        {renderBody()}
      </View>
      <Toast
        icon="lock-outline"
        message={t("family.archived.readOnly")}
        onHide={vm.readOnlyScope.onToastHide}
        visible={vm.readOnlyScope.toastVisible}
      />
    </Screen>
  );
}

export default Wide;
