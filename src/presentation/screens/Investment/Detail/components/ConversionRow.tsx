import { Pressable, View } from "react-native";

import { Badge, Icon, Text } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { InvestmentOperationType } from "@domain/entities/investment/enums";
import {
  InvestmentAssetDetail,
  InvestmentOperation,
} from "@domain/entities/investment/InvestmentEntities";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import {
  formatDay,
  formatMoney,
  formatQuantity,
} from "@screens/Investment/models/format";
import investmentTestIds from "@screens/Investment/testIds";

import { InvestmentDetailVM } from "../hooks";
import { conversionOutcome } from "../models/conversionModel";
import useStyles from "../styles";

const ids = investmentTestIds.conversion;

interface Props {
  asset: InvestmentAssetDetail;
  compact: boolean;
  operation: InvestmentOperation;
  vm: InvestmentDetailVM;
}

// Spec 112 section 8: the row of a conversion operation. The origin shows "Conversão → BTHF11" with the ratio, the
// quotas that came in and the fraction, the destination "Conversão de BCFF11" with the inherited cost; both open the
// row menu (edit, sell fraction, delete) through the "⋯" button.
function ConversionRow({ asset, compact, operation, vm }: Props) {
  const { styles } = useStyles(compact);
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { colors, sizes } = useKitTheme();
  const info = operation.conversion;
  const isOut = operation.type === InvestmentOperationType.CONVERSION_OUT;
  const outcome = conversionOutcome(asset, operation);
  const ticker = info?.ticker ?? "";
  const ratio = info ? { from: info.ratioFrom, to: info.ratioTo } : undefined;
  const detail = isOut
    ? t("investment.conversion.rowDetailOut", {
        fraction: formatQuantity(outcome?.fractionQuantity ?? "0", localeTag),
        from: ratio?.from ?? "",
        quantity: formatQuantity(outcome?.quantityIn ?? "0", localeTag),
        to: ratio?.to ?? "",
      })
    : t("investment.conversion.rowDetailIn", {
        from: ratio?.from ?? "",
        to: ratio?.to ?? "",
      });
  const cost = isOut
    ? (operation.conversionCost ?? 0)
    : (operation.conversionCost ?? 0) -
      (operation.corporateEvent?.fractionCost ?? 0);

  return (
    <View style={styles.opRow} testID={`${ids.rowMenu}-row-${operation.id}`}>
      <Pressable
        accessibilityRole="button"
        onPress={() => vm.onConversionMenuOpen(operation.id)}
        style={[styles.opCell, { flex: 3 }]}
        testID={`${investmentTestIds.detail.operationRow}-${operation.id}`}
      >
        <Badge label={t(`investment.operation.${operation.type}`)} />
        <Text.BodyStrong
          value={t(
            isOut
              ? "investment.conversion.rowOut"
              : "investment.conversion.rowIn",
            { ticker },
          )}
        />
        <Text.Caption
          tone="secondary"
          value={`${formatDay(operation.date, localeTag)} · ${detail}`}
        />
      </Pressable>
      <View style={styles.opCellRight}>
        <Text.BodyStrong
          tabular
          value={`${isOut ? "−" : "+"}${formatQuantity(operation.quantity, localeTag)}`}
        />
        <Text.Caption
          tabular
          tone="secondary"
          value={formatMoney(cost, asset.currency, localeTag)}
        />
      </View>
      <Pressable
        accessibilityLabel={t("investment.conversion.menuLabel")}
        accessibilityRole="button"
        onPress={() => vm.onConversionMenuOpen(operation.id)}
        testID={`${ids.rowMenu}-${operation.id}`}
      >
        <Icon
          color={colors.textSecondary}
          name="dots-horizontal"
          size={sizes.iconMd}
        />
      </Pressable>
    </View>
  );
}

export default ConversionRow;
