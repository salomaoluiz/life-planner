import { View } from "react-native";

import { StatusBanner } from "@components";
import { useTranslation } from "@presentation/i18n";

import { InvestmentOverviewVM } from "../hooks";
import useStyles from "../styles";
import overviewTestIds from "../testIds";

// Spec 110 FR 26-27: quotes that did not update today, AND assets counted at their cost for lack of a price.
function StateBanners(props: { vm: InvestmentOverviewVM }) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const summary = props.vm.dashboard.data?.summary;

  if (
    !summary ||
    (summary.staleQuotes === 0 && summary.assetsWithoutValue === 0)
  ) {
    return null;
  }

  return (
    <View style={styles.detail}>
      {summary.staleQuotes > 0 ? (
        <StatusBanner
          message={t("investment.overview.state.staleQuotes", {
            count: summary.staleQuotes,
          })}
          testID={overviewTestIds.staleQuotes}
        />
      ) : null}
      {summary.assetsWithoutValue > 0 ? (
        <StatusBanner
          message={t("investment.overview.state.withoutValue", {
            count: summary.assetsWithoutValue,
          })}
          testID={overviewTestIds.withoutValue}
        />
      ) : null}
    </View>
  );
}

export default StateBanners;
