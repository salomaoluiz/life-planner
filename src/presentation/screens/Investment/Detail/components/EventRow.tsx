import { Pressable, View } from "react-native";

import { Badge, Button, Text } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { InvestmentOperationType } from "@domain/entities/investment/enums";
import {
  InvestmentAssetDetail,
  InvestmentOperation,
} from "@domain/entities/investment/InvestmentEntities";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import {
  pendingFractionOf,
  quantityDelta,
} from "@screens/Investment/Events/models/eventInfo";
import {
  formatDay,
  formatMoney,
  formatQuantity,
  formatUnitPrice,
} from "@screens/Investment/models/format";
import investmentTestIds from "@screens/Investment/testIds";

import { InvestmentDetailVM } from "../hooks";
import useStyles from "../styles";

const ids = investmentTestIds.event;

interface Props {
  asset: InvestmentAssetDetail;
  compact: boolean;
  operation: InvestmentOperation;
  vm: InvestmentDetailVM;
}

// Spec 108 section 8: an event row of the operations table: a neutral chip, the ratio and the position before and
// after, the fraction that left it, the quantity delta, no finance entry and the "Vender fração" action while pending.
function EventRow({ asset, compact, operation, vm }: Props) {
  const { styles } = useStyles(compact);
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { spacing } = useKitTheme();
  const event = operation.corporateEvent;
  const pending = pendingFractionOf(
    asset.position.pendingFractions,
    operation.id,
  );
  const hasFraction = event && Number(event.fractionQuantity) > 0;
  const delta = event
    ? quantityDelta(event.quantityBefore, event.quantityAfter)
    : "0";
  function price(value: null | string) {
    return value ? formatUnitPrice(value, asset.currency, localeTag, 2) : "—";
  }
  const detail = event
    ? t(
        operation.type === InvestmentOperationType.BONUS
          ? "investment.event.detailBonus"
          : "investment.event.detailRatio",
        {
          after: formatQuantity(event.quantityAfter, localeTag),
          before: formatQuantity(event.quantityBefore, localeTag),
          from: event.ratioFrom ?? "",
          percent: event.bonusPercent ?? "",
          to: event.ratioTo ?? "",
        },
      )
    : "";

  return (
    <View testID={`${ids.row}-${operation.id}`}>
      <Pressable
        accessibilityRole="button"
        onPress={() => vm.onOperationPress(operation.id)}
        testID={`${investmentTestIds.detail.operationRow}-${operation.id}`}
      >
        <View style={styles.opRow}>
          <View style={styles.opCell}>
            <Badge label={t(`investment.operation.${operation.type}`)} />
            <Text.Caption
              tone="secondary"
              value={formatDay(operation.date, localeTag)}
            />
          </View>
          <View style={[styles.opCell, { flex: 2 }]}>
            <Text.BodyStrong value={detail} />
            {event && hasFraction ? (
              <Text.Caption
                tone="secondary"
                value={t("investment.event.detailFraction", {
                  after: price(event.averagePriceAfter),
                  before: price(event.averagePriceBefore),
                  cost: formatMoney(
                    event.fractionCost,
                    asset.currency,
                    localeTag,
                  ),
                  fraction: formatQuantity(event.fractionQuantity, localeTag),
                })}
              />
            ) : null}
          </View>
          <View style={styles.opCellRight}>
            <Text.Body
              tabular
              value={`${Number(delta) > 0 ? "+" : ""}${formatQuantity(delta, localeTag)}`}
            />
            <Text.Caption
              tone="secondary"
              value={t("investment.event.noFinanceShort")}
            />
          </View>
        </View>
      </Pressable>
      {pending && !vm.readOnly && !vm.archived ? (
        <View
          style={{
            alignItems: "flex-end",
            paddingBottom: spacing.sm,
            paddingHorizontal: spacing.md,
          }}
        >
          <Button.Secondary
            label={t("investment.fraction.sell", {
              quantity: formatQuantity(pending.quantity, localeTag),
            })}
            onPress={() => vm.onSellFraction(operation.id)}
            testID={`${ids.sellFraction}-${operation.id}`}
          />
        </View>
      ) : null}
    </View>
  );
}

export default EventRow;
