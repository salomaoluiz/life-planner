import { StyleSheet, View } from "react-native";

import { Button, Card, Text } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { InvestmentMarketIndex } from "@domain/entities/investment/InvestmentEntities";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { formatDay } from "@screens/Investment/models/format";

import { InvestmentSettingsVM } from "../hooks";
import {
  followersText,
  monthLabel,
  percentLabel,
} from "../models/settingsModel";
import settingsTestIds from "../testIds";

interface CardRow {
  label: string;
  value: string;
}

interface IndexCardProps {
  caption: string;
  index: InvestmentMarketIndex;
  main: string;
  onOpen: (index: InvestmentMarketIndex) => void;
  reference: string;
  rows: CardRow[];
  testID: string;
  title: string;
}

function IndexCard(props: IndexCardProps) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    head: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    root: { flexBasis: 260, flexGrow: 1, flexShrink: 1, minWidth: 240 },
    row: { flexDirection: "row", justifyContent: "space-between" },
    rows: { gap: spacing.xs },
    stack: { gap: spacing.sm },
  });

  return (
    <View style={styles.root}>
      <Card fill testID={props.testID}>
        <View style={styles.stack}>
          <View style={styles.head}>
            <Text.BodyStrong value={props.title} />
            <Text.Caption tone="secondary" value={props.reference} />
          </View>
          <View>
            <Text.Display tabular value={props.main} />
            <Text.Caption tone="secondary" value={props.caption} />
          </View>
          <View style={styles.rows}>
            {props.rows.map((row) => (
              <View key={row.label} style={styles.row}>
                <Text.Caption tone="secondary" value={row.label} />
                <Text.Caption tabular value={row.value} />
              </View>
            ))}
          </View>
          <Button.Ghost
            inline
            label={t("investment.settings.seeHistory")}
            onPress={() => props.onOpen(props.index)}
            testID={settingsTestIds.history.open(props.index)}
          />
        </View>
      </Card>
    </View>
  );
}

// The three cards of the artboard "Configurações": CDI, Selic and IPCA, each with its history.
function IndexCards({ vm }: { vm: InvestmentSettingsVM }) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  });
  const { cdi, ipca, selic } = vm.data ?? {};
  function percent(value: null | string | undefined, places = 2): string {
    return `${percentLabel(value, places, localeTag)}%`;
  }
  function day(value: null | string | undefined): string {
    return value ? formatDay(value, localeTag) : "—";
  }

  return (
    <View style={styles.grid}>
      {cdi ? (
        <IndexCard
          caption={t("investment.settings.cdi.annual")}
          index="CDI"
          main={percent(cdi.annual)}
          onOpen={vm.onOpenHistory}
          reference={t("investment.settings.ref", { date: day(cdi.date) })}
          rows={[
            {
              label: t("investment.settings.daily"),
              value: percent(cdi.daily, 6),
            },
            {
              label: t("investment.settings.lastChange"),
              value: day(cdi.lastChangeDate),
            },
            {
              label: t("investment.settings.followers"),
              value: followersText(cdi.followers),
            },
          ]}
          testID={settingsTestIds.card("cdi")}
          title="CDI"
        />
      ) : null}
      {selic ? (
        <IndexCard
          caption={t("investment.settings.selic.target")}
          index="SELIC"
          main={percent(selic.target)}
          onOpen={vm.onOpenHistory}
          reference={t("investment.settings.ref", { date: day(selic.date) })}
          rows={[
            {
              label: t("investment.settings.daily"),
              value: percent(selic.daily, 6),
            },
            {
              label: t("investment.settings.lastChange"),
              value: day(selic.lastChangeDate),
            },
            {
              label: t("investment.settings.followers"),
              value: followersText(selic.followers),
            },
          ]}
          testID={settingsTestIds.card("selic")}
          title="Selic"
        />
      ) : null}
      {ipca ? (
        <IndexCard
          caption={t("investment.settings.ipca.accumulated")}
          index="IPCA"
          main={percent(ipca.accumulated12m)}
          onOpen={vm.onOpenHistory}
          reference={t("investment.settings.ref", {
            date: ipca.month ? monthLabel(ipca.month, localeTag) : "—",
          })}
          rows={[
            {
              label: t("investment.settings.ipca.month", {
                month: ipca.month ? monthLabel(ipca.month, localeTag) : "—",
              }),
              value: percent(ipca.monthly),
            },
            {
              label: t("investment.settings.expected"),
              value: percent(ipca.expected12m),
            },
            {
              label: t("investment.settings.followers"),
              value: followersText(ipca.followers),
            },
          ]}
          testID={settingsTestIds.card("ipca")}
          title="IPCA"
        />
      ) : null}
    </View>
  );
}

export default IndexCards;
