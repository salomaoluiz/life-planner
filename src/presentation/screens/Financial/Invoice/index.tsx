import { View } from "react-native";

import {
  AmountText,
  Badge,
  BottomSheet,
  Button,
  ConfirmDialog,
  ErrorState,
  GroupHeader,
  IconTile,
  ListItem,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import { formatDayMonth } from "@screens/Financial/Cards/models/cardList";

import PayInvoiceSheet from "./components/PayInvoiceSheet";
import { useInvoiceViewModel } from "./hooks";
import useStyles from "./styles";
import invoiceTestIds from "./testIds";

function InvoiceModal() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const vm = useInvoiceViewModel();
  const { invoice } = vm;

  function renderBody() {
    if (vm.errorMessage) {
      return (
        <ErrorState
          message={t("financial.invoice.notFound")}
          onRetry={vm.onRetry}
          retryLabel={t("common.actions.tryAgain")}
        />
      );
    }

    if (!invoice) {
      return <Skeleton.ListItem testID="invoice-skeleton" />;
    }

    const isPaid = invoice.status === "PAID";
    const isClosed = invoice.status === "CLOSED";
    const dates = invoice.dates;

    return (
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <AmountText
              size="heading"
              testID={invoiceTestIds.amount}
              type="EXPENSE"
              value={invoice.amountCents}
            />
            <Badge
              label={t(
                `financial.cards.invoice.status.${invoice.status}` as TranslationKeys,
              )}
              testID={invoiceTestIds.status}
              tone={isPaid ? "income" : "accent"}
            />
          </View>
          <Text.Caption
            tone="secondary"
            value={t("financial.invoice.dates", {
              closing: formatDayMonth(dates.closingDate),
              due: formatDayMonth(dates.dueDate),
              pay: formatDayMonth(dates.paymentDate),
            })}
          />
          {isPaid && invoice.paidOn ? (
            <Text.Body
              testID={invoiceTestIds.paidInfo}
              value={
                invoice.paidExternal || !invoice.paidAccountName
                  ? t("financial.invoice.paidInfoExternal", {
                      date: formatDayMonth(invoice.paidOn),
                    })
                  : t("financial.invoice.paidInfo", {
                      account: invoice.paidAccountName,
                      date: formatDayMonth(invoice.paidOn),
                    })
              }
            />
          ) : null}
        </View>
        <View>
          <GroupHeader
            title={t("financial.invoice.purchases", {
              count: invoice.purchases.length,
            })}
          />
          {invoice.purchases.map((purchase) => (
            <ListItem
              inset
              key={purchase.id}
              leading={
                <IconTile
                  color={purchase.categoryColor}
                  name={purchase.categoryIcon}
                />
              }
              onPress={() => vm.onPurchasePress(purchase.id)}
              subtitle={`${purchase.categoryName} · ${formatDayMonth(toIsoDate(purchase.date))}`}
              testID={invoiceTestIds.purchase}
              title={purchase.description}
              trailing={
                <AmountText type="EXPENSE" value={purchase.amountCents} />
              }
            />
          ))}
        </View>
        <View style={styles.actions}>
          {isClosed ? (
            <Button.Primary
              fullWidth
              label={t("financial.invoice.payInvoice")}
              onPress={vm.onPayPress}
              size="lg"
              testID={invoiceTestIds.pay}
            />
          ) : null}
          {isPaid ? (
            <Button.Ghost
              label={t("financial.invoice.undo")}
              onPress={vm.onUndoPress}
              testID={invoiceTestIds.undo}
              tone="expense"
            />
          ) : null}
          {invoice.status === "OPEN" ? (
            <Button.Secondary
              fullWidth
              label={t("financial.invoice.addPurchase")}
              onPress={vm.onAddPurchasePress}
              testID={invoiceTestIds.addPurchase}
            />
          ) : null}
        </View>
      </View>
    );
  }

  const month = invoice
    ? new Intl.DateTimeFormat(localeTag, { month: "long" }).format(
        invoice.referenceMonthDate,
      )
    : "";

  return (
    <>
      <BottomSheet
        closeLabel={t("common.actions.close")}
        onClose={vm.onClose}
        presentation="inline"
        testID={invoiceTestIds.screen}
        title={
          invoice
            ? t("financial.invoice.title", { card: invoice.cardTitle, month })
            : t("financial.cards.open")
        }
        visible
      >
        {renderBody()}
      </BottomSheet>
      {vm.isPayOpen && invoice ? (
        <PayInvoiceSheet
          accountId={vm.accountId}
          accountOptions={vm.accountOptions}
          amountCents={invoice.amountCents}
          errorKey={vm.formErrorKey}
          isPaying={vm.isPaying}
          isSubmitDisabled={vm.isSubmitDisabled}
          method={vm.method}
          onAccountChange={vm.onAccountChange}
          onClose={vm.onPayClose}
          onConfirm={vm.onPayConfirm}
          onMethodChange={vm.onMethodChange}
          onPaidOnChange={vm.onPaidOnChange}
          paidOn={vm.paidOn}
        />
      ) : null}
      <ConfirmDialog
        cancelLabel={t("common.actions.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("financial.invoice.undo")}
        loading={vm.isUndoing}
        message={t("financial.invoice.undoMessage")}
        onCancel={vm.onUndoCancel}
        onConfirm={vm.onUndoConfirm}
        testID={invoiceTestIds.undoConfirm}
        title={t("financial.invoice.undoTitle")}
        visible={vm.isUndoOpen}
      />
    </>
  );
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export { InvoiceModal };
export default InvoiceModal;
