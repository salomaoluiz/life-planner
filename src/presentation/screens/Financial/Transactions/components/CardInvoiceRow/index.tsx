import { View } from "react-native";

import {
  AmountText,
  Badge,
  Button,
  Card,
  Icon,
  IconTile,
  ListItem,
  Text,
  Touchable,
} from "@components";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import CardInvoiceUIModel from "@screens/Financial/Transactions/models/CardInvoiceUIModel";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import useStyles from "./styles";

interface Props {
  expanded: boolean;
  invoice: CardInvoiceUIModel;
  onOpen: (invoice: CardInvoiceUIModel) => void;
  onPurchasePress: (id: string) => void;
  onToggle: (id: string) => void;
}

// One card invoice as a grouped line of the day list: tap to expand its purchases (spec 029 FR 24).
function CardInvoiceRow(props: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { expanded, invoice } = props;
  const month = new Intl.DateTimeFormat(localeTag, { month: "long" }).format(
    invoice.referenceMonthDate,
  );
  const title = invoice.lastDigits
    ? `${invoice.cardTitle} ••${invoice.lastDigits}`
    : invoice.cardTitle;

  return (
    <Card padding="sm" testID={transactionsTestIds.cardInvoiceRow}>
      <Touchable
        accessibilityLabel={title}
        accessibilityRole="button"
        onPress={() => props.onToggle(invoice.id)}
        testID={transactionsTestIds.cardInvoiceToggle}
      >
        <View style={styles.header}>
          <IconTile color={invoice.cardColor} name="credit-card-outline" />
          <View style={styles.headerText}>
            <Text.BodyStrong
              numberOfLines={1}
              testID={transactionsTestIds.cardInvoiceTitle}
              value={title}
            />
            <Text.Caption
              tone="secondary"
              value={t("financial.transactions.cardInvoice.title", { month })}
            />
            <View style={styles.badges}>
              <Badge
                label={t(
                  `financial.cards.invoice.status.${invoice.status}` as TranslationKeys,
                )}
                testID={transactionsTestIds.cardInvoiceStatus}
                tone={invoice.status === "PAID" ? "income" : "accent"}
              />
              {invoice.paymentAfterDue ? (
                <Badge
                  label={t("financial.cards.invoice.paymentAfterDue")}
                  tone="warning"
                />
              ) : null}
            </View>
            {invoice.status === "PAID" ? (
              <Text.Caption
                testID={transactionsTestIds.cardInvoicePaidInfo}
                tone="secondary"
                value={
                  invoice.paidExternal || !invoice.paidAccountName
                    ? t("financial.transactions.cardInvoice.paidExternal")
                    : t("financial.transactions.cardInvoice.paidWith", {
                        account: invoice.paidAccountName,
                      })
                }
              />
            ) : null}
          </View>
          <AmountText
            testID={transactionsTestIds.cardInvoiceAmount}
            type="EXPENSE"
            value={invoice.amountCents}
          />
          <Icon name={expanded ? "chevron-up" : "chevron-down"} size={20} />
        </View>
      </Touchable>
      {expanded ? (
        <View style={styles.purchases}>
          {invoice.purchases.map((purchase) => (
            <ListItem
              key={purchase.id}
              leading={
                <IconTile
                  color={purchase.categoryColor}
                  name={purchase.categoryIcon}
                />
              }
              onPress={() => props.onPurchasePress(purchase.id)}
              subtitle={`${purchase.categoryName} · ${formatShortDate(purchase.date, localeTag)}`}
              testID={transactionsTestIds.cardInvoicePurchase}
              title={purchase.description}
              trailing={
                <AmountText type="EXPENSE" value={purchase.amountCents} />
              }
            />
          ))}
          <Button.Secondary
            fullWidth
            label={t("financial.transactions.cardInvoice.open")}
            onPress={() => props.onOpen(invoice)}
            testID={transactionsTestIds.cardInvoiceOpen}
          />
        </View>
      ) : null}
    </Card>
  );
}

function formatShortDate(date: Date, localeTag: string) {
  return new Intl.DateTimeFormat(localeTag, {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export default CardInvoiceRow;
