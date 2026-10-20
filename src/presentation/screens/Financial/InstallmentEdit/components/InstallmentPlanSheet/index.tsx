import { View } from "react-native";

import InstallmentPlanDTO from "@application/dto/financial/InstallmentPlanDTO";
import {
  AmountText,
  Badge,
  BottomSheet,
  Button,
  ListItem,
  Text,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import { formatReferenceMonth } from "@screens/Financial/Cards/models/cardList";
import useStyles from "@screens/Financial/InstallmentEdit/styles";
import { installmentPlanTestIds } from "@screens/Financial/InstallmentEdit/testIds";
import { decimalStringToCents } from "@utils/money";

interface Props {
  cardTitle?: string;
  onClose: () => void;
  onPrepay?: () => void;
  onUndoPrepayment?: () => void;
  plan: InstallmentPlanDTO;
}

const STATUS_KEYS: Record<string, TranslationKeys> = {
  CLOSED: "financial.installmentPlan.statusClosed",
  OPEN: "financial.installmentPlan.statusOpen",
  PAID: "financial.installmentPlan.statusPaid",
};

// The plan of an installment purchase: its total (always the SUM of the installments) and every installment (spec 030 FR 9, 10).
function InstallmentPlanSheet(props: Props) {
  const { plan } = props;
  const { t } = useTranslation();
  const { styles } = useStyles();
  const localeTag = useLocaleTag();
  const { prepayment } = plan;
  // Prepaying needs at least one installment outside a paid invoice (spec 032 FR 11).
  const canPrepay =
    !prepayment &&
    !!props.onPrepay &&
    plan.installments.some((row) => row.invoiceStatus !== "PAID");

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      onClose={props.onClose}
      testID={installmentPlanTestIds.sheet}
      title={t("financial.installmentPlan.title")}
      visible
    >
      <View style={styles.form}>
        <View style={styles.planHeader}>
          <Text.BodyStrong value={plan.description} />
          {props.cardTitle ? (
            <Text.Caption tone="secondary" value={props.cardTitle} />
          ) : null}
          <Text.Caption
            tone="secondary"
            value={`${t("financial.installmentPlan.purchaseDate")}: ${new Intl.DateTimeFormat(localeTag).format(new Date(plan.date))}`}
          />
          <Text.Body
            testID={installmentPlanTestIds.count}
            value={`${t("financial.installmentPlan.count")}: ${plan.installmentCount}`}
          />
          <AmountText
            currency={plan.currency}
            size="heading"
            testID={installmentPlanTestIds.total}
            type="EXPENSE"
            value={decimalStringToCents(plan.totalValue)}
          />
        </View>
        {prepayment ? (
          <Text.Body
            testID={installmentPlanTestIds.prepayment}
            tone="secondary"
            value={t("financial.installmentPlan.prepaidInto", {
              discount: formatAmount(
                prepayment.discount,
                localeTag,
                plan.currency,
              ),
              month: formatReferenceMonth(
                prepayment.targetInvoiceMonth,
                localeTag,
              ),
            })}
          />
        ) : null}
        <View>
          {plan.installments.map((row) => (
            <ListItem
              key={row.id}
              subtitle={formatReferenceMonth(row.invoiceMonth, localeTag)}
              testID={installmentPlanTestIds.row}
              title={`${row.installmentNumber}/${plan.installmentCount}`}
              trailing={
                <View style={styles.planRowTrailing}>
                  <AmountText
                    currency={plan.currency}
                    type="EXPENSE"
                    value={decimalStringToCents(row.value)}
                  />
                  <Badge
                    label={t(STATUS_KEYS[row.invoiceStatus])}
                    tone={row.invoiceStatus === "PAID" ? "income" : "accent"}
                  />
                  {row.prepaid ? (
                    <Badge
                      label={t("financial.prepayment.prepaidBadge")}
                      tone="accent"
                    />
                  ) : null}
                </View>
              }
            />
          ))}
        </View>
        {canPrepay ? (
          <Button.Secondary
            fullWidth
            label={t("financial.prepayment.action")}
            onPress={props.onPrepay as () => void}
            testID={installmentPlanTestIds.prepay}
          />
        ) : null}
        {prepayment && props.onUndoPrepayment ? (
          <Button.Ghost
            label={t("financial.prepayment.undo")}
            onPress={props.onUndoPrepayment}
            testID={installmentPlanTestIds.undoPrepayment}
            tone="expense"
          />
        ) : null}
      </View>
    </BottomSheet>
  );
}

export default InstallmentPlanSheet;
