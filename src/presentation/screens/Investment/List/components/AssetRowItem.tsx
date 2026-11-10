import { Pressable, View } from "react-native";

import { Badge, Card, Text, useDensity } from "@components";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { AssetRow, labelOf } from "@screens/Investment/models/assetList";
import {
  formatDay,
  formatMoney,
  formatPercent,
  formatQuantity,
  formatResult,
  formatUnitPrice,
  resultTone,
} from "@screens/Investment/models/format";
import investmentTestIds from "@screens/Investment/testIds";

import useStyles from "../styles";

interface Props {
  onPress: (id: string) => void;
  row: AssetRow;
}

// Wide: one table row (asset, quantity, average price, cost, current value, open result, realized);
// compact: the card of the mobile artboard (ticker, owner, current value, quantity · average price, open result).
function AssetRowItem({ onPress, row }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const compact = useDensity().density === "compact";
  const { asset } = row;
  const { position } = asset;
  function money(cents: number) {
    return formatMoney(cents, asset.currency, localeTag);
  }
  function result(cents: number) {
    return formatResult(cents, asset.currency, localeTag);
  }
  const ownerText =
    row.ownerLabel === "personal"
      ? t("financial.common.personal")
      : row.ownerLabel.family;
  const average = position.averagePrice
    ? formatUnitPrice(position.averagePrice, asset.currency, localeTag, 4)
    : "—";
  const quantity = formatQuantity(position.quantity, localeTag);
  const openText =
    position.openResult === null
      ? t("investment.position.noValue")
      : `${result(position.openResult)}${
          position.openResultPercent === null
            ? ""
            : ` · ${formatPercent(position.openResultPercent, localeTag)}`
        }`;
  const openTone = resultTone(position.openResult);
  const label = labelOf(asset);

  if (compact) {
    return (
      <Card
        onPress={() => onPress(asset.id)}
        testID={`${investmentTestIds.list.row}-${asset.id}`}
      >
        <View style={styles.cardTop}>
          <View style={styles.tickerRow}>
            <Text.BodyStrong value={label} />
            <Badge label={ownerText} />
          </View>
          <Text.BodyStrong
            tabular
            value={
              position.currentValue === null
                ? "—"
                : money(position.currentValue)
            }
          />
        </View>
        <View style={styles.cardLine}>
          <Text.Caption
            tone="secondary"
            value={`${quantity} · ${t("investment.position.averagePriceShort")} ${average}`}
          />
          <Text.Caption tabular tone={openTone} value={openText} />
        </View>
      </Card>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(asset.id)}
      testID={`${investmentTestIds.list.row}-${asset.id}`}
    >
      <View style={styles.row}>
        <View style={styles.cellAsset}>
          <View style={styles.tickerRow}>
            <Text.BodyStrong value={label} />
            <Badge label={ownerText} />
          </View>
          <Text.Caption tone="secondary" value={asset.name} />
        </View>
        <View style={styles.cellNumber}>
          <Text.Body tabular value={quantity} />
        </View>
        <View style={styles.cellNumber}>
          <Text.Body tabular value={average} />
        </View>
        <View style={styles.cellNumber}>
          <Text.Body tabular value={money(position.cost)} />
        </View>
        <View style={styles.cellNumber}>
          <Text.Body
            tabular
            value={
              position.currentValue === null
                ? t("investment.position.noValue")
                : money(position.currentValue)
            }
          />
          {position.currentValueDate ? (
            <Text.Caption
              tone="secondary"
              value={t("investment.list.onDate", {
                date: formatDay(position.currentValueDate, localeTag),
              })}
            />
          ) : null}
        </View>
        <View style={styles.cellNumberWide}>
          <Text.Body tabular tone={openTone} value={openText} />
        </View>
        <View style={styles.cellNumber}>
          <Text.Body
            tabular
            tone={resultTone(position.realizedResult)}
            value={
              asset.operationCount > 0 && position.realizedResult !== 0
                ? result(position.realizedResult)
                : "—"
            }
          />
        </View>
      </View>
    </Pressable>
  );
}

export default AssetRowItem;
