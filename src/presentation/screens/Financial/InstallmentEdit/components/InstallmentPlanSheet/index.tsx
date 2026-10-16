import { View } from "react-native";

import InstallmentPlanDTO from "@application/dto/financial/InstallmentPlanDTO";
import { AmountText, Badge, BottomSheet, ListItem, Text } from "@components";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import { formatReferenceMonth } from "@screens/Financial/Cards/models/cardList";
import useStyles from "@screens/Financial/InstallmentEdit/styles";
import { installmentPlanTestIds } from "@screens/Financial/InstallmentEdit/testIds";
import { decimalStringToCents } from "@utils/money";

interface Props {
  cardTitle?: string;
  onClose: () => void;
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
            size="heading"
            testID={installmentPlanTestIds.total}
            type="EXPENSE"
            value={decimalStringToCents(plan.totalValue)}
          />
        </View>
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
                    type="EXPENSE"
                    value={decimalStringToCents(row.value)}
                  />
                  <Badge
                    label={t(STATUS_KEYS[row.invoiceStatus])}
                    tone={row.invoiceStatus === "PAID" ? "income" : "accent"}
                  />
                </View>
              }
            />
          ))}
        </View>
      </View>
    </BottomSheet>
  );
}

export default InstallmentPlanSheet;
