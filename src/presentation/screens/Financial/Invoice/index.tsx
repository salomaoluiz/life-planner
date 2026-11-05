import { View } from "react-native";

import {
  AmountText,
  Badge,
  BottomSheet,
  Button,
  Card,
  ConfirmDialog,
  ErrorState,
  FormColumns,
  GroupHeader,
  IconTile,
  ListItem,
  Text,
  useSheetLayout,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import Skeleton from "@components/Skeleton";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import {
  formatDayMonth,
  formatReferenceMonth,
} from "@screens/Financial/Cards/models/cardList";
import { installmentTitle } from "@screens/Financial/models/installments";
import NoteIcon from "@screens/Financial/Transactions/components/NoteIcon";
import { InvoiceCreditUIModel } from "@screens/Financial/Transactions/models/CardInvoiceUIModel";

import PayInvoiceSheet from "./components/PayInvoiceSheet";
import { useInvoiceViewModel } from "./hooks";
import useStyles from "./styles";
import invoiceTestIds from "./testIds";

const CREDIT_ICONS = {
  EARLY_PAYMENT: "cash-fast",
  PREPAYMENT_DISCOUNT: "tag-minus",
  REFUND: "cash-refund",
} as const;
// The API stores the English description of the discount row; the screen translates it.
// Fixed width of the summary column on a wide sheet (spec 037 FR 11).
const INVOICE_SUMMARY_WIDTH = 320;
const DISCOUNT_PREFIX = "Prepayment discount · ";

// Reads the sheet layout, so it must render inside the BottomSheet: on a wide
// sheet the actions become one wrapping row.
function InvoiceActions({ children }: { children: React.ReactNode }) {
  const { columns } = useSheetLayout();
  const { styles } = useStyles(columns);

  return (
    <View style={styles.actions} testID={invoiceTestIds.actions}>
      {children}
    </View>
  );
}

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

    // Stored projected purchases plus the 034 projections of a later invoice (they come apart from the invoice).
    const projectedCount = invoice.projectedCount + vm.projected.length;
    const projectedTotalCents =
      invoice.projectedTotalCents +
      vm.projected.reduce((sum, item) => sum + item.amountCents, 0);
    const hasProjected = projectedCount > 0;
    const isPaid = invoice.status === "PAID";
    const isClosed = invoice.status === "CLOSED";
    const dates = invoice.dates;

    return (
      <View style={styles.body}>
        <FormColumns
          compactGap="lg"
          left={
            <View style={styles.header}>
              {hasProjected ? (
                <Text.Caption
                  tone="secondary"
                  value={t("financial.projected.invoice.effective")}
                />
              ) : null}
              <View style={styles.headerRow}>
                <AmountText
                  currency={invoice.currency}
                  size="heading"
                  testID={invoiceTestIds.amount}
                  type="EXPENSE"
                  value={
                    hasProjected ? invoice.effectiveCents : invoice.amountCents
                  }
                />
                <Badge
                  label={t(
                    `financial.cards.invoice.status.${invoice.status}` as TranslationKeys,
                  )}
                  testID={invoiceTestIds.status}
                  tone={isPaid ? "income" : "accent"}
                />
              </View>
              {hasProjected ? (
                <Card testID={invoiceTestIds.projectedSummary} variant="dashed">
                  <View style={styles.projectedRow}>
                    <Badge
                      label={t("financial.projected.chip")}
                      tone="accent"
                    />
                    <Text.Body
                      value={t("financial.projected.invoice.projectedTotal", {
                        value: formatAmount(
                          projectedTotalCents,
                          localeTag,
                          invoice.currency,
                        ),
                      })}
                    />
                  </View>
                  <Text.Caption
                    tone="secondary"
                    value={t("financial.projected.invoice.plusProjected", {
                      count: projectedCount,
                      value: formatAmount(
                        projectedTotalCents - invoice.effectiveCents,
                        localeTag,
                        invoice.currency,
                      ),
                    })}
                  />
                </Card>
              ) : null}
              <Text.Caption
                tone="secondary"
                value={t("financial.invoice.dates", {
                  closing: formatDayMonth(dates.closingDate),
                  due: formatDayMonth(dates.dueDate),
                  pay: formatDayMonth(dates.paymentDate),
                })}
              />
              {invoice.earlyPaidCents > 0 ? (
                <View>
                  <Text.Body
                    testID={invoiceTestIds.paidEarly}
                    tone="income"
                    value={t("financial.earlyPayment.paidEarly", {
                      value: formatAmount(
                        invoice.earlyPaidCents,
                        localeTag,
                        invoice.currency,
                      ),
                    })}
                  />
                  <Text.Body
                    testID={invoiceTestIds.leftToPay}
                    value={`${t("financial.earlyPayment.leftToPay")}: ${formatAmount(invoice.amountCents, localeTag, invoice.currency)}`}
                  />
                </View>
              ) : null}
              {invoice.creditCarryCents > 0 ? (
                <Text.Body
                  testID={invoiceTestIds.creditCarry}
                  tone="income"
                  value={t("financial.invoice.creditCarry", {
                    month: formatReferenceMonth(
                      invoice.creditCarryMonth,
                      localeTag,
                    ),
                    value: formatAmount(
                      invoice.creditCarryCents,
                      localeTag,
                      invoice.currency,
                    ),
                  })}
                />
              ) : null}
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
          }
          leftWidth={INVOICE_SUMMARY_WIDTH}
          right={
            <>
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
                    title={installmentTitle(
                      purchase.description,
                      purchase.installment,
                      (params) => t("financial.installment.label", params),
                    )}
                    trailing={
                      <View style={styles.trailing}>
                        {purchase.notes ? (
                          <NoteIcon note={purchase.notes} />
                        ) : null}
                        <AmountText
                          currency={invoice.currency}
                          type="EXPENSE"
                          value={purchase.amountCents}
                        />
                        {purchase.prepaid ? (
                          <Badge
                            label={t("financial.prepayment.prepaidBadge")}
                            testID={invoiceTestIds.prepaid}
                            tone="accent"
                          />
                        ) : null}
                      </View>
                    }
                  />
                ))}
              </View>
              {hasProjected ? (
                <View>
                  <GroupHeader
                    title={t("financial.projected.invoice.sectionTitle", {
                      count: projectedCount,
                    })}
                  />
                  {invoice.projectedPurchases.map((purchase) => (
                    <ListItem
                      inset
                      key={purchase.id}
                      leading={
                        <IconTile
                          color={purchase.categoryColor}
                          name={purchase.categoryIcon}
                        />
                      }
                      meta={
                        <Badge
                          label={t("financial.projected.chip")}
                          tone="accent"
                        />
                      }
                      subtitle={`${purchase.categoryName} · ${formatDayMonth(toIsoDate(purchase.date))}`}
                      testID={invoiceTestIds.projectedPurchase}
                      title={
                        purchase.recurrenceId
                          ? `${purchase.description} ↻`
                          : purchase.description
                      }
                      trailing={
                        <View style={styles.trailing}>
                          <AmountText
                            currency={invoice.currency}
                            type="EXPENSE"
                            value={purchase.amountCents}
                          />
                          <Button.Secondary
                            label={t("financial.projected.confirm.action")}
                            onPress={() => vm.onConfirmPress(purchase)}
                            testID={invoiceTestIds.projectedConfirm}
                          />
                        </View>
                      }
                    />
                  ))}
                  {vm.projected.map((item) => (
                    <ListItem
                      inset
                      key={item.id}
                      leading={
                        <IconTile
                          color={item.categoryColor}
                          name={item.categoryIcon}
                        />
                      }
                      meta={
                        <Badge
                          label={t("financial.recurrence.projected")}
                          tone="accent"
                        />
                      }
                      onPress={() => vm.onProjectedPress(item)}
                      subtitle={`${item.categoryName} · ${formatDayMonth(toIsoDate(item.date))}`}
                      testID={invoiceTestIds.projected}
                      title={
                        item.counter
                          ? `${item.description} ${item.counter}`
                          : item.description
                      }
                      trailing={
                        <AmountText
                          currency={invoice.currency}
                          type="EXPENSE"
                          value={item.amountCents}
                        />
                      }
                    />
                  ))}
                </View>
              ) : null}
              {invoice.credits.length > 0 || invoice.carryInCents < 0 ? (
                <View>
                  <GroupHeader
                    title={t("financial.invoice.credits", {
                      count: invoice.credits.length,
                    })}
                  />
                  {invoice.carryInCents < 0 ? (
                    <ListItem
                      inset
                      leading={
                        <IconTile name="swap-horizontal" tone="income" />
                      }
                      testID={invoiceTestIds.carryIn}
                      title={t("financial.invoice.creditFrom", {
                        month: formatReferenceMonth(
                          invoice.previousMonth,
                          localeTag,
                        ),
                      })}
                      trailing={
                        <AmountText
                          currency={invoice.currency}
                          type="INCOME"
                          value={-invoice.carryInCents}
                        />
                      }
                    />
                  ) : null}
                  {invoice.credits.map((credit) => (
                    <ListItem
                      inset
                      key={credit.id}
                      leading={
                        <IconTile
                          name={CREDIT_ICONS[credit.kind]}
                          tone="income"
                        />
                      }
                      onPress={
                        credit.kind === "PREPAYMENT_DISCOUNT"
                          ? undefined
                          : () => vm.onCreditPress(credit)
                      }
                      subtitle={creditSubtitle(credit)}
                      testID={invoiceTestIds.credit}
                      title={creditTitle(credit)}
                      trailing={
                        <AmountText
                          currency={invoice.currency}
                          type="INCOME"
                          value={credit.amountCents}
                        />
                      }
                    />
                  ))}
                </View>
              ) : null}
            </>
          }
          testID={invoiceTestIds.screen}
        />
        <InvoiceActions>
          {isClosed ? (
            <Button.Primary
              fullWidth
              label={t("financial.invoice.payInvoice")}
              onPress={vm.onPayPress}
              size="lg"
              testID={invoiceTestIds.pay}
            />
          ) : null}
          {invoice.canAddCredit ? (
            <Button.Secondary
              fullWidth
              label={t("financial.refund.new")}
              onPress={vm.onRefundPress}
              testID={invoiceTestIds.refund}
            />
          ) : null}
          {invoice.canAddCredit && invoice.amountCents > 0 ? (
            <Button.Secondary
              fullWidth
              label={t("financial.earlyPayment.action")}
              onPress={vm.onEarlyPaymentPress}
              testID={invoiceTestIds.earlyPayment}
            />
          ) : null}
          {isPaid && invoice.paidOn ? (
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
        </InvoiceActions>
      </View>
    );
  }

  function creditTitle(credit: InvoiceCreditUIModel) {
    return credit.kind === "PREPAYMENT_DISCOUNT"
      ? t("financial.prepayment.discountLine", {
          description: credit.description.replace(DISCOUNT_PREFIX, ""),
        })
      : credit.description;
  }

  function creditSubtitle(credit: InvoiceCreditUIModel) {
    if (credit.kind === "REFUND") {
      return credit.refundedName
        ? `${credit.refundedName} · ${formatDayMonth(toIsoDate(credit.date))}`
        : formatDayMonth(toIsoDate(credit.date));
    }

    if (credit.kind === "EARLY_PAYMENT") {
      return credit.method === "EXTERNAL" || !credit.accountName
        ? t("financial.earlyPayment.boleto")
        : credit.accountName;
    }

    return formatDayMonth(toIsoDate(credit.date));
  }

  const nextMonthLabel = invoice
    ? new Intl.DateTimeFormat(localeTag, { month: "long" }).format(
        new Date(
          invoice.referenceMonthDate.getFullYear(),
          invoice.referenceMonthDate.getMonth() + 1,
          1,
        ),
      )
    : "";
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
        size="form"
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
          currency={invoice.currency}
          errorKey={vm.formErrorKey}
          isPaying={vm.isPaying}
          isResolving={vm.isResolving}
          isSubmitDisabled={vm.isSubmitDisabled}
          method={vm.method}
          nextMonthLabel={nextMonthLabel}
          onAccountChange={vm.onAccountChange}
          onClose={vm.onPayClose}
          onConfirm={vm.onPayConfirm}
          onConfirmProjected={vm.onConfirmPress}
          onDiscardProjected={vm.onProjectedDiscard}
          onMethodChange={vm.onMethodChange}
          onMoveProjected={vm.onProjectedMove}
          onPaidOnChange={vm.onPaidOnChange}
          paidOn={vm.paidOn}
          projected={vm.projectedPurchases}
        />
      ) : null}
      <ConfirmDialog
        cancelLabel={t("common.actions.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("financial.projected.pay.discard")}
        loading={vm.isResolving}
        message={t("financial.projected.pay.discardSeries")}
        onCancel={vm.onDiscardCancel}
        onConfirm={vm.onDiscardConfirm}
        testID={invoiceTestIds.discardConfirm}
        title={t("financial.projected.pay.discard")}
        visible={!!vm.discarding}
      />
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
