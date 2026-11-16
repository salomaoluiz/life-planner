import { View } from "react-native";

import { StatTile } from "@components";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import {
  compactAmount,
  formatDay,
} from "@screens/Financial/Overview/models/overviewFormat";
import {
  formatMoney,
  formatPercent,
  formatResult,
} from "@screens/Investment/models/format";

import { InvestmentOverviewVM } from "../hooks";
import useStyles from "../styles";
import overviewTestIds from "../testIds";

type Tone = "bad" | "good" | "neutral";

// Spec 110 FR 11: the five tiles of the period. Values are BRL; the result tiles carry their sign and tone.
function Tiles(props: { vm: InvestmentOverviewVM }) {
  const { vm } = props;
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const summary = vm.dashboard.data?.summary;
  const loading = !summary;

  function money(cents: number) {
    return formatMoney(cents, "BRL", localeTag);
  }

  function tile(
    name: string,
    label: string,
    value: number,
    text: string,
    tone: Tone,
    extra?: string,
  ) {
    return (
      <View style={styles.tile}>
        <StatTile
          compactValue={compactAmount(value, localeTag, "BRL")}
          delta={{ text, tone }}
          extra={extra ? { text: extra } : undefined}
          label={label}
          loading={loading}
          testID={overviewTestIds.tile(name)}
          value={
            name === "current-value" || name === "invested"
              ? money(value)
              : formatResult(value, "BRL", localeTag)
          }
        />
      </View>
    );
  }

  const result = summary?.openResult ?? 0;
  const percent = summary?.openResultPercent;

  return (
    <View style={styles.tiles}>
      {tile(
        "current-value",
        t("investment.overview.tile.currentValue"),
        summary?.currentValue ?? 0,
        t("investment.overview.tile.currentValueCaption", {
          date: formatDay(vm.period.to, localeTag),
        }),
        "neutral",
      )}
      {tile(
        "invested",
        t("investment.overview.tile.invested"),
        summary?.invested ?? 0,
        t("investment.overview.tile.investedCaption"),
        "neutral",
      )}
      {tile(
        "open-result",
        t("investment.overview.tile.openResult"),
        result,
        percent === null || percent === undefined
          ? "—"
          : t("investment.overview.tile.openResultCaption", {
              percent: formatPercent(percent, localeTag),
            }),
        toneOf(result),
      )}
      {tile(
        "realized",
        t("investment.overview.tile.realized"),
        summary?.realizedResult ?? 0,
        t("investment.overview.tile.realizedCaption", {
          count: summary?.salesCount ?? 0,
        }),
        toneOf(summary?.realizedResult ?? 0),
      )}
      {tile(
        "income",
        t("investment.overview.tile.income"),
        summary?.incomeReceived ?? 0,
        t("investment.overview.tile.incomeCaption"),
        "neutral",
        summary && summary.incomePlanned > 0
          ? t("investment.overview.tile.incomePlanned", {
              amount: money(summary.incomePlanned),
            })
          : undefined,
      )}
    </View>
  );
}

function toneOf(cents: number): Tone {
  if (cents === 0) {
    return "neutral";
  }

  return cents > 0 ? "good" : "bad";
}

export default Tiles;
