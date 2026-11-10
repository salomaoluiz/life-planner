import { Pressable, View } from "react-native";

import { Badge, Card, Text, useDensity } from "@components";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { AssetRow, labelOf } from "@screens/Investment/models/assetList";
import {
  formatMoney,
  formatPercent,
  formatQuantity,
  formatResult,
  formatTime,
  formatUnitPrice,
  resultTone,
} from "@screens/Investment/models/format";
import {
  isQuoteUnavailable,
  todayChange,
  updatedInfo,
} from "@screens/Investment/models/quoteInfo";
import investmentTestIds from "@screens/Investment/testIds";

import useStyles from "../styles";

interface Props {
  onPress: (id: string) => void;
  row: AssetRow;
}

// Wide: one table row (asset, quantity, price, today, current value, result, updated; spec 104 artboard);
// compact: the card of the mobile artboard (ticker, owner, value in BRL, quantity · price, today).
function AssetRowItem({ onPress, row }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const compact = useDensity().density === "compact";
  const { asset } = row;
  const { position } = asset;
  function money(cents: number, currency: CurrencyCode = asset.currency) {
    return formatMoney(cents, currency, localeTag);
  }
  const ownerText =
    row.ownerLabel === "personal"
      ? t("financial.common.personal")
      : row.ownerLabel.family;
  const price = position.currentUnitPrice
    ? formatUnitPrice(position.currentUnitPrice, asset.currency, localeTag)
    : "—";
  const quantity = formatQuantity(position.quantity, localeTag);
  const change = todayChange(asset);
  const changeText = change === null ? "—" : formatPercent(change, localeTag);
  // A USD asset shows its value and result in BRL when it has them (the dollar move is part of the result).
  const result = asset.brl ? asset.brl.result : position.openResult;
  const resultPercent = asset.brl
    ? asset.brl.resultPercent
    : position.openResultPercent;
  const resultCurrency: CurrencyCode = asset.brl ? "BRL" : asset.currency;
  const resultText =
    result === null
      ? t("investment.position.noValue")
      : `${formatResult(result, resultCurrency, localeTag)}${
          resultPercent === null
            ? ""
            : ` · ${formatPercent(resultPercent, localeTag)}`
        }`;
  const updated = updatedInfo(asset, new Date(), (iso) =>
    formatTime(iso, localeTag),
  );
  const updatedText = updatedLabel(updated, t, localeTag);
  const label = labelOf(asset);
  const unavailable = isQuoteUnavailable(asset);
  const compactValue = compactValueOf();
  const compactNote = compactNoteOf();
  const testID = `${investmentTestIds.list.row}-${asset.id}`;

  function compactValueOf(): string {
    if (asset.brl) {
      return money(asset.brl.marketValue, "BRL");
    }

    return position.currentValue === null ? "—" : money(position.currentValue);
  }
  function compactNoteOf(): string {
    if (unavailable) {
      return t("investment.quote.unavailable");
    }

    return change === null
      ? updatedText
      : t("investment.list.todayShort", { change: changeText });
  }

  if (compact) {
    return (
      <Card onPress={() => onPress(asset.id)} testID={testID}>
        <View style={styles.cardTop}>
          <View style={styles.tickerRow}>
            <Text.BodyStrong value={label} />
            <Badge label={ownerText} />
          </View>
          <Text.BodyStrong tabular value={compactValue} />
        </View>
        <View style={styles.cardLine}>
          <Text.Caption tone="secondary" value={`${quantity} · ${price}`} />
          <Text.Caption
            tabular
            tone={unavailable ? "warning" : resultTone(change)}
            value={compactNote}
          />
        </View>
      </Card>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(asset.id)}
      testID={testID}
    >
      <View style={styles.row}>
        <View style={styles.cellAsset}>
          <View style={styles.tickerRow}>
            <Text.BodyStrong value={label} />
            <Badge label={ownerText} />
            {unavailable ? (
              <Badge label={t("investment.quote.unavailable")} />
            ) : null}
          </View>
          <Text.Caption tone="secondary" value={asset.name} />
        </View>
        <View style={styles.cellNumber}>
          <Text.Body tabular value={quantity} />
        </View>
        <View style={styles.cellNumber}>
          <Text.Body tabular value={price} />
        </View>
        <View style={styles.cellNumber}>
          <Text.Body tabular tone={resultTone(change)} value={changeText} />
        </View>
        <View style={styles.cellNumberWide}>
          <Text.Body
            tabular
            value={
              position.currentValue === null
                ? t("investment.position.noValue")
                : money(position.currentValue)
            }
          />
          {asset.brl ? (
            <Text.Caption
              tabular
              tone="secondary"
              value={money(asset.brl.marketValue, "BRL")}
            />
          ) : null}
        </View>
        <View style={styles.cellNumberWide}>
          <Text.Body tabular tone={resultTone(result)} value={resultText} />
        </View>
        <View style={styles.cellUpdated}>
          <Text.Caption
            testID={`${testID}-updated`}
            tone={updated.warning ? "warning" : "secondary"}
            value={updatedText}
          />
        </View>
      </View>
    </Pressable>
  );
}

function updatedLabel(
  info: ReturnType<typeof updatedInfo>,
  t: ReturnType<typeof useTranslation>["t"],
  localeTag: string,
): string {
  switch (info.kind) {
    case "date":
      return t("investment.quote.updatedOn", {
        date: new Intl.DateTimeFormat(localeTag, {
          day: "2-digit",
          month: "2-digit",
          timeZone: "UTC",
        }).format(new Date(`${info.date}T00:00:00Z`)),
      });
    case "manual":
      return t("investment.quote.manualOn", {
        date: new Intl.DateTimeFormat(localeTag, {
          day: "2-digit",
          month: "2-digit",
          timeZone: "UTC",
        }).format(new Date(`${info.date}T00:00:00Z`)),
      });
    case "time":
      return t("investment.quote.updatedAt", { time: info.time });
    case "yesterday":
      return t("investment.quote.updatedYesterday", { time: info.time });
    default:
      return "—";
  }
}

export default AssetRowItem;
