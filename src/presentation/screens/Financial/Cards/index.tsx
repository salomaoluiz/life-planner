import { FlashList } from "@shopify/flash-list";
import { ScrollView, View } from "react-native";

import {
  AmountText,
  Card,
  ChipGroup,
  CreditCardTile,
  EmptyState,
  ErrorState,
  GroupHeader,
  Icon,
  IconButton,
  ListItem,
  MetricBlock,
  ProgressBar,
  SegmentedControl,
  Text,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import { translateChoices } from "@screens/Financial/models/ownerOptions";

import InvoiceRow from "./components/InvoiceRow";
import { useCardsViewModel } from "./hooks";
import { amountProps, CardEntry } from "./models/cardList";
import useStyles from "./styles";
import cardsTestIds from "./testIds";

const SKELETON_ROWS = [0, 1];

function FinancialCards() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { sizes } = useKitTheme();
  const vm = useCardsViewModel();

  function brandLabel(brand: string) {
    return t(`financial.cards.brand.${brand}` as TranslationKeys);
  }

  const toolbar = (
    <View style={styles.toolbar} testID="cards-toolbar">
      <Card testID={cardsTestIds.total}>
        <View style={styles.totalBody}>
          <View style={styles.totalRow}>
            <View style={styles.totalColumn}>
              <Text.Overline
                tone="secondary"
                value={t("financial.cards.totalLimit")}
              />
              <AmountText
                currency={DEFAULT_CURRENCY}
                size="heading"
                testID={cardsTestIds.totalLimit}
                value={vm.aggregate.totalLimit}
              />
            </View>
            <IconButton
              accessibilityLabel={t("financial.cardForm.titleNew")}
              name="plus"
              onPress={vm.onAddPress}
              testID={cardsTestIds.addButton}
            />
          </View>
          <ProgressBar
            accessibilityLabel={t("financial.cards.usedPercent", {
              percent: Math.round(vm.usedProgress * 100),
            })}
            progress={vm.usedProgress}
            testID="cards-progress"
            tone={vm.aggregate.available < 0 ? "expense" : "accent"}
          />
          <View style={styles.metrics}>
            <MetricBlock
              label={t("financial.cards.used")}
              value={
                <AmountText
                  currency={DEFAULT_CURRENCY}
                  {...amountProps(vm.aggregate.used)}
                />
              }
            />
            <MetricBlock
              label={t("financial.cards.available")}
              value={
                <AmountText
                  currency={DEFAULT_CURRENCY}
                  {...amountProps(vm.aggregate.available)}
                />
              }
            />
          </View>
        </View>
      </Card>
      <ChipGroup
        layout="scroll"
        mode="single"
        onChange={vm.onOwnerFilterChange}
        options={translateChoices(vm.ownerChoices, t)}
        testID={cardsTestIds.ownerFilter}
        value={vm.ownerFilter}
      />
      {vm.summaries.length > 0 && (
        <ScrollView
          contentContainerStyle={styles.carousel}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {vm.summaries.map((summary) => (
            <CreditCardTile
              accessibilityLabel={t("financial.cards.tileLabel", {
                amount: formatAmount(
                  summary.available,
                  localeTag,
                  summary.card.currency,
                ),
                brand: brandLabel(summary.card.brand),
                title: summary.card.title,
              })}
              available={
                <AmountText
                  currency={summary.card.currency}
                  {...amountProps(summary.available)}
                />
              }
              availableLabel={t("financial.cards.available")}
              brandLabel={brandLabel(summary.card.brand)}
              key={summary.card.id}
              lastDigits={summary.card.lastDigits}
              onPress={() => vm.onCardSelect(summary.card.id)}
              selected={summary.card.id === vm.selectedId}
              testID={cardsTestIds.tile}
              tint={summary.card.color}
              title={summary.card.title}
            />
          ))}
        </ScrollView>
      )}
      {vm.selected && (
        <View>
          <View style={styles.selectedHeader}>
            <GroupHeader title={vm.selected.card.title} />
            <View style={styles.headerActions}>
              <IconButton
                accessibilityLabel={t("financial.refund.new")}
                name="cash-refund"
                onPress={vm.onRefundPress}
                testID={cardsTestIds.refundButton}
              />
              <IconButton
                accessibilityLabel={t("financial.earlyPayment.action")}
                name="cash-fast"
                onPress={vm.onEarlyPaymentPress}
                testID={cardsTestIds.earlyPaymentButton}
              />
              <IconButton
                accessibilityLabel={t("financial.cards.edit")}
                name="pencil-outline"
                onPress={vm.onEditPress}
                testID={cardsTestIds.editButton}
              />
            </View>
          </View>
          <SegmentedControl
            accessibilityLabel={vm.selected.card.title}
            onChange={vm.onInvoiceTabChange}
            options={[
              { label: t("financial.cards.open"), value: "open" },
              { label: t("financial.cards.closed"), value: "closed" },
              { label: t("financial.cards.upcoming"), value: "upcoming" },
            ]}
            testID={cardsTestIds.invoiceTabs}
            value={vm.invoiceTab}
          />
        </View>
      )}
    </View>
  );

  function renderItem({ item }: { item: CardEntry }) {
    if (item.kind === "invoice") {
      return (
        <InvoiceRow
          invoice={item.invoice}
          onPress={() =>
            vm.onInvoicePress(item.cardId, item.invoice.referenceMonth)
          }
        />
      );
    }

    if (item.kind === "noUpcoming") {
      return (
        <Text.Body
          testID={cardsTestIds.noUpcoming}
          tone="secondary"
          value={t("financial.cards.noUpcoming")}
        />
      );
    }

    if (item.kind === "noClosed") {
      return (
        <Text.Body
          testID={cardsTestIds.noClosed}
          tone="secondary"
          value={t("financial.cards.noClosed")}
        />
      );
    }

    if (item.kind === "archivedToggle") {
      return (
        <ListItem
          inset
          onPress={vm.onArchivedToggle}
          testID={cardsTestIds.archivedToggle}
          title={t("financial.cards.archived", { count: item.count })}
          trailing={
            <Icon
              name={item.expanded ? "chevron-up" : "chevron-down"}
              size={sizes.iconMd}
            />
          }
        />
      );
    }

    return (
      <ListItem
        inset
        onPress={() => vm.onArchivedCardPress(item.card.id)}
        subtitle={vm.ownerName(item.card.ownerId)}
        testID={cardsTestIds.row}
        title={item.card.title}
      />
    );
  }

  if (vm.errorMessage) {
    return (
      <ErrorState
        message={vm.errorMessage}
        onRetry={vm.onRetry}
        retryLabel={t("common.actions.tryAgain")}
      />
    );
  }

  if (vm.isLoading) {
    return (
      <View style={styles.root} testID={cardsTestIds.screen}>
        {toolbar}
        {SKELETON_ROWS.map((row) => (
          <Skeleton.ListItem key={row} testID="cards-skeleton" />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.root} testID={cardsTestIds.screen}>
      <FlashList
        data={vm.entries}
        estimatedItemSize={96}
        getItemType={(entry) => entry.kind}
        keyExtractor={(entry) => entry.key}
        ListEmptyComponent={
          vm.hasCards ? null : (
            <EmptyState
              actionLabel={t("financial.cards.empty.action")}
              message={t("financial.cards.empty.message")}
              onAction={vm.onAddPress}
              testID={cardsTestIds.emptyState}
              title={t("financial.cards.empty.title")}
            />
          )
        }
        ListHeaderComponent={toolbar}
        onRefresh={vm.onRefresh}
        refreshing={vm.isRefreshing}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

export default FinancialCards;
