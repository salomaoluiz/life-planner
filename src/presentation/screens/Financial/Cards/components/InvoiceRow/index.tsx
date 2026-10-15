import { View } from "react-native";

import { InvoiceDTO } from "@application/dto/financial/CreditCardOverviewDTO";
import { AmountText, Badge, Card, Text } from "@components";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import {
  formatDayMonth,
  formatReferenceMonth,
} from "@screens/Financial/Cards/models/cardList";
import cardsTestIds from "@screens/Financial/Cards/testIds";

import useStyles from "./styles";

interface InvoiceRowProps {
  invoice: InvoiceDTO;
}

function InvoiceRow({ invoice }: InvoiceRowProps) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();

  return (
    <Card testID={cardsTestIds.invoiceRow}>
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.title}>
            <Text.BodyStrong
              value={formatReferenceMonth(invoice.referenceMonth, localeTag)}
            />
            <Badge
              label={t(
                `financial.cards.invoice.status.${invoice.status}` as TranslationKeys,
              )}
              tone={invoice.status === "OPEN" ? "accent" : "neutral"}
            />
          </View>
          <AmountText
            testID={`${cardsTestIds.invoiceRow}-amount`}
            value={invoice.amount}
          />
        </View>
        <Text.Caption
          tone="secondary"
          value={t("financial.cards.invoice.dates", {
            closing: formatDayMonth(invoice.closingDate),
            due: formatDayMonth(invoice.dueDate),
          })}
        />
        <View style={styles.badges}>
          <Text.Caption
            tone="secondary"
            value={t("financial.cards.invoice.payOn", {
              date: formatDayMonth(invoice.paymentDate),
            })}
          />
          {invoice.paymentAfterDue ? (
            <Badge
              label={t("financial.cards.invoice.paymentAfterDue")}
              testID={`${cardsTestIds.invoiceRow}-warning`}
              tone="warning"
            />
          ) : null}
        </View>
      </View>
    </Card>
  );
}

export default InvoiceRow;
