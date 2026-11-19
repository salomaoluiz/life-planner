import { View } from "react-native";

import { SelectField, StatusBanner } from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { useTheme } from "@presentation/theme";
import splitFormTestIds from "@screens/Financial/Transactions/modals/SplitForm/testIds";

interface Props {
  currency: CurrencyCode;
  onAdjust: () => void;
  onPartPick: (key: string) => void;
  // The parts that can take the difference.
  partOptions: { label: string; value: string }[];
  // Positive: left to distribute; negative: the parts pass the total (cents).
  remainingCents: number;
}

// Spec 119 FR 42: "Falta distribuir R$ X" / "As partes passam do total em R$ X" with the two ways to fix it. The
// banner is a live region; the form only saves when the sum matches.
function SplitRemainingBanner(props: Props) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { theme } = useTheme();
  const over = props.remainingCents < 0;

  if (props.remainingCents === 0) {
    return null;
  }
  const amount = formatAmount(
    Math.abs(props.remainingCents),
    localeTag,
    props.currency,
  );
  // The adjustment takes the signed difference: a discount WHEN the parts pass the total.
  const signed = formatAmount(
    props.remainingCents * -1,
    localeTag,
    props.currency,
  );

  return (
    <View style={{ gap: theme.sizes.spacing.sm }}>
      <StatusBanner
        actionLabel={t("financial.split.toAdjustment", { amount: signed })}
        message={t(
          over ? "financial.split.over" : "financial.split.remaining",
          {
            amount,
          },
        )}
        onAction={props.onAdjust}
        testID={splitFormTestIds.banner}
      />
      <SelectField
        closeLabel={t("common.actions.close")}
        label={t(
          over
            ? "financial.split.toPartOver"
            : "financial.split.toPartRemaining",
        )}
        onChange={props.onPartPick}
        options={props.partOptions}
        sheetTitle={t("financial.split.parts", {
          count: props.partOptions.length,
        })}
        testID={splitFormTestIds.bannerPart}
        value={undefined}
      />
    </View>
  );
}

export default SplitRemainingBanner;
