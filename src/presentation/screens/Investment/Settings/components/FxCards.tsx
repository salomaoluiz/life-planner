import { StyleSheet, View } from "react-native";

import { Card, Text } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { formatDay, formatMoney } from "@screens/Investment/models/format";

import { InvestmentSettingsVM } from "../hooks";
import settingsTestIds from "../testIds";

// The pairs stored by spec 104, read only (spec 113 FR 17, 21).
function FxCards({ vm }: { vm: InvestmentSettingsVM }) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    card: { flexBasis: 240, flexGrow: 1, flexShrink: 1, minWidth: 220 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
    row: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    stack: { gap: spacing.xs },
  });
  const pairs = vm.data?.fx ?? [];

  if (pairs.length === 0) {
    return null;
  }

  return (
    <View style={styles.stack} testID={settingsTestIds.fx}>
      <Text.Overline value={t("investment.settings.fx")} />
      <View style={styles.grid}>
        {pairs.map((pair) => (
          <View key={pair.pair} style={styles.card}>
            <Card>
              <View style={styles.row}>
                <View>
                  <Text.BodyStrong value={pair.pair.replace("-", " → ")} />
                  <Text.Caption
                    tone="secondary"
                    value={t("investment.settings.fxQuoted", {
                      date: formatDay(pair.quotedAt.slice(0, 10), localeTag),
                    })}
                  />
                </View>
                <Text.Heading
                  tabular
                  value={formatMoney(
                    Math.round(Number(pair.rate) * 100),
                    "BRL",
                    localeTag,
                  )}
                />
              </View>
            </Card>
          </View>
        ))}
      </View>
    </View>
  );
}

export default FxCards;
