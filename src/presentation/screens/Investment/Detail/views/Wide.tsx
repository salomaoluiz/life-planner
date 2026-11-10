import { Pressable, View } from "react-native";

import {
  AdaptiveViewProps,
  Badge,
  BottomSheet,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  ListItem,
  MetricBlock,
  Screen,
  Section,
  StatusBanner,
  Text,
  Toast,
  useDensity,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { InvestmentOperationType } from "@domain/entities/investment/enums";
import {
  InvestmentAssetDetail,
  InvestmentOperation,
} from "@domain/entities/investment/InvestmentEntities";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { labelOf } from "@screens/Investment/models/assetList";
import {
  formatDay,
  formatMoney,
  formatPercent,
  formatQuantity,
  formatResult,
  formatUnitPrice,
  resultTone,
} from "@screens/Investment/models/format";
import investmentTestIds from "@screens/Investment/testIds";

import { InvestmentDetailVM } from "../hooks";
import useStyles from "../styles";

const ids = investmentTestIds.detail;

function Header({
  asset,
  compact,
  vm,
}: {
  asset: InvestmentAssetDetail;
  compact: boolean;
  vm: InvestmentDetailVM;
}) {
  const { styles } = useStyles(compact);
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <View style={styles.panel}>
        <View style={styles.titleRow}>
          <Text.Title value={labelOf(asset)} />
          {asset.ticker ? (
            <Text.Body tone="secondary" value={asset.name} />
          ) : null}
        </View>
        <View style={styles.chips}>
          <Badge label={t(`investment.class.${asset.assetClass}`)} />
          <Badge label={vm.ownerLabel || t("financial.common.personal")} />
          <Badge label={asset.currency} />
        </View>
      </View>
      {vm.readOnly ? null : (
        <View style={styles.actions}>
          {vm.archived ? null : (
            <>
              <Button.Secondary
                label={t("investment.asset.updateValue")}
                onPress={vm.onUpdateValue}
                testID={ids.updateValue}
              />
              <Button.Primary
                label={`+ ${t("investment.operation.add")}`}
                onPress={vm.onAddOperation}
                testID={ids.addOperation}
              />
            </>
          )}
          <IconButton
            accessibilityLabel={t("investment.asset.moreActions")}
            name="dots-horizontal"
            onPress={vm.onMenuOpen}
            testID={ids.actionsMenu}
            variant="raised"
          />
        </View>
      )}
    </View>
  );
}

function OperationRow({
  asset,
  operation,
  vm,
}: {
  asset: InvestmentAssetDetail;
  operation: InvestmentOperation;
  vm: InvestmentDetailVM;
}) {
  const compact = useDensity().density === "compact";
  const { styles } = useStyles(compact);
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { colors, sizes } = useKitTheme();
  const sell = operation.type === InvestmentOperationType.SELL;
  function money(cents: number) {
    return formatMoney(cents, asset.currency, localeTag);
  }
  const account = operation.accountId
    ? (vm.accountNames.get(operation.accountId) ?? "—")
    : "—";
  const result =
    operation.realizedResult === null
      ? "—"
      : formatResult(operation.realizedResult, asset.currency, localeTag);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => vm.onOperationPress(operation.id)}
      testID={`${ids.operationRow}-${operation.id}`}
    >
      <View style={styles.opRow}>
        <View style={styles.opCell}>
          <Text.BodyStrong
            tone={sell ? "warning" : "accent"}
            value={t(`investment.operation.${operation.type}`)}
          />
          <Text.Caption
            tone="secondary"
            value={formatDay(operation.date, localeTag)}
          />
        </View>
        <View style={styles.opCell}>
          <Text.Body
            tabular
            value={`${formatQuantity(operation.quantity, localeTag)} × ${formatUnitPrice(operation.unitPrice, asset.currency, localeTag)}`}
          />
          <Text.Caption
            tone="secondary"
            value={`${t("investment.operation.fees")} ${money(operation.feesTotal)}${compact ? "" : ` · ${account}`}`}
          />
        </View>
        <View style={styles.opCellRight}>
          <Text.BodyStrong tabular value={money(operation.total)} />
          <Text.Caption
            tabular
            tone={resultTone(operation.realizedResult)}
            value={result}
          />
        </View>
        <Icon
          color={
            operation.transactionId ? colors.accentText : colors.textSecondary
          }
          name={operation.transactionId ? "link-variant" : "link-variant-off"}
          size={sizes.iconMd}
        />
      </View>
    </Pressable>
  );
}

function Operations({
  asset,
  vm,
}: {
  asset: InvestmentAssetDetail;
  vm: InvestmentDetailVM;
}) {
  const { t } = useTranslation();

  return (
    <Section title={t("investment.detail.operations")}>
      {asset.operations.length === 0 ? (
        <EmptyState
          icon="swap-horizontal"
          message={t("investment.detail.operationsEmpty")}
          title={t("investment.detail.operations")}
        />
      ) : (
        <Card padding="sm">
          {asset.operations.map((operation) => (
            <OperationRow
              asset={asset}
              key={operation.id}
              operation={operation}
              vm={vm}
            />
          ))}
        </Card>
      )}
    </Section>
  );
}

function Summary({
  asset,
  compact,
  sells,
}: {
  asset: InvestmentAssetDetail;
  compact: boolean;
  sells: number;
}) {
  const { styles } = useStyles(compact);
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { position } = asset;
  function money(cents: number) {
    return formatMoney(cents, asset.currency, localeTag);
  }
  const noValue = t("investment.position.noValue");
  const current =
    position.currentValue === null ? noValue : money(position.currentValue);
  const open =
    position.openResult === null
      ? noValue
      : formatResult(position.openResult, asset.currency, localeTag);
  const percent =
    position.openResultPercent === null
      ? undefined
      : formatPercent(position.openResultPercent, localeTag);
  const basis =
    position.currentUnitPrice && position.currentValueDate
      ? t("investment.position.currentValueBasis", {
          date: formatDay(position.currentValueDate, localeTag),
          price: formatUnitPrice(
            position.currentUnitPrice,
            asset.currency,
            localeTag,
          ),
          quantity: formatQuantity(position.quantity, localeTag),
        })
      : undefined;

  function card(
    label: string,
    value: string,
    testID: string,
    extra?: string,
    tone: "expense" | "income" | "primary" | "secondary" = "primary",
  ) {
    return (
      <View style={styles.cardWrap}>
        <MetricBlock
          label={label}
          value={
            <>
              <Text.Heading tabular testID={testID} tone={tone} value={value} />
              {extra ? (
                <Text.Caption
                  tone={tone === "primary" ? "secondary" : tone}
                  value={extra}
                />
              ) : null}
            </>
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.cards}>
      {card(
        t("investment.position.quantity"),
        formatQuantity(position.quantity, localeTag),
        ids.quantity,
      )}
      {card(
        t("investment.position.averagePrice"),
        position.averagePrice
          ? formatUnitPrice(position.averagePrice, asset.currency, localeTag, 4)
          : "—",
        ids.averagePrice,
      )}
      {card(t("investment.position.cost"), money(position.cost), ids.cost)}
      {card(
        t("investment.position.currentValue"),
        current,
        ids.currentValue,
        basis,
      )}
      {card(
        t("investment.position.openResult"),
        open,
        ids.openResult,
        percent,
        resultTone(position.openResult),
      )}
      {card(
        t("investment.position.realized"),
        formatResult(position.realizedResult, asset.currency, localeTag),
        ids.realized,
        sells > 0
          ? t(pluralKey("investment.detail.sells", sells), { count: sells })
          : undefined,
        resultTone(position.realizedResult),
      )}
    </View>
  );
}

function Valuations({
  asset,
  vm,
}: {
  asset: InvestmentAssetDetail;
  vm: InvestmentDetailVM;
}) {
  const { styles } = useStyles(false);
  const { t } = useTranslation();
  const localeTag = useLocaleTag();

  return (
    <Section title={t("investment.detail.valuations")}>
      <Card padding="sm">
        {asset.valuations.length === 0 ? (
          <Text.Caption
            tone="secondary"
            value={t("investment.detail.valuationsEmpty")}
          />
        ) : (
          asset.valuations.map((valuation) => (
            <View
              key={valuation.id}
              style={styles.valuationRow}
              testID={`${ids.valuationRow}-${valuation.id}`}
            >
              <Text.Body value={formatDay(valuation.date, localeTag)} />
              <Text.BodyStrong
                tabular
                value={formatUnitPrice(
                  valuation.unitPrice,
                  asset.currency,
                  localeTag,
                )}
              />
              {vm.readOnly || vm.archived ? null : (
                <IconButton
                  accessibilityLabel={t("investment.form.operation.removeFee")}
                  name="close"
                  onPress={() => vm.onDeleteValuation(valuation.id)}
                  testID={`${ids.valuationDelete}-${valuation.id}`}
                />
              )}
            </View>
          ))
        )}
      </Card>
      <Text.Caption
        tone="secondary"
        value={t("investment.detail.valuationsFootnote")}
      />
    </Section>
  );
}

function Wide({ vm }: AdaptiveViewProps<InvestmentDetailVM>) {
  const compact = useDensity().density === "compact";
  const { styles } = useStyles(compact);
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { sizes } = useKitTheme();

  if (vm.isLoading) {
    return (
      <Screen testID={ids.screen}>
        <Skeleton.Card />
        <Skeleton.ListItem />
        <Skeleton.ListItem />
      </Screen>
    );
  }

  if (vm.isNotFound || !vm.asset) {
    return (
      <Screen testID={ids.screen}>
        <ErrorState
          message={t("investment.detail.notFound")}
          onRetry={vm.onBack}
          retryLabel={t("investment.detail.back")}
          testID={ids.notFound}
        />
      </Screen>
    );
  }

  const asset = vm.asset;

  return (
    <Screen
      onRefresh={vm.onRefresh}
      refreshing={vm.isRefreshing}
      scroll
      testID={ids.screen}
    >
      <View style={styles.content}>
        <Button.Ghost
          icon="arrow-left"
          inline
          label={t("investment.detail.back")}
          onPress={vm.onBack}
          testID={ids.back}
        />
        <Header asset={asset} compact={compact} vm={vm} />
        {vm.archived ? (
          <StatusBanner
            actionLabel={
              vm.readOnly ? undefined : t("investment.archive.reactivate")
            }
            icon="archive-outline"
            message={t("investment.archive.banner", {
              date: vm.archivedAt
                ? formatDay(vm.archivedAt.slice(0, 10), localeTag)
                : "",
            })}
            onAction={vm.onArchiveToggle}
            testID={ids.archiveBanner}
          />
        ) : null}
        {vm.errorMessage ? (
          <Text.Caption
            tone="expense"
            value={t(vm.errorMessage.key, vm.errorMessage.params)}
          />
        ) : null}
        <Summary asset={asset} compact={compact} sells={vm.sellCount} />
        <View style={styles.sections}>
          <View style={styles.sectionMain}>
            <Operations asset={asset} vm={vm} />
          </View>
          <View style={styles.sectionSide}>
            <Valuations asset={asset} vm={vm} />
          </View>
        </View>
      </View>
      <BottomSheet
        closeLabel={t("common.actions.close")}
        onClose={vm.onMenuClose}
        title={t("investment.asset.moreActions")}
        visible={vm.isMenuOpen}
      >
        <ListItem
          inset
          leading={<Icon name="pencil-outline" size={sizes.iconMd} />}
          onPress={vm.onEdit}
          testID={ids.editMenu}
          title={t("investment.asset.edit")}
        />
        <ListItem
          inset
          leading={
            <Icon
              name={
                vm.archived ? "archive-arrow-up-outline" : "archive-outline"
              }
              size={sizes.iconMd}
            />
          }
          onPress={vm.onArchiveToggle}
          testID={ids.archiveMenu}
          title={
            vm.archived
              ? t("investment.archive.reactivate")
              : t("investment.asset.archive")
          }
        />
        <ListItem
          inset
          leading={<Icon name="delete-outline" size={sizes.iconMd} />}
          onPress={vm.onDeleteOpen}
          testID={ids.deleteMenu}
          title={t("investment.asset.delete")}
        />
      </BottomSheet>
      <ConfirmDialog
        cancelLabel={t("investment.form.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("investment.asset.deleteConfirm")}
        loading={vm.isDeleting}
        message={`${t("investment.asset.deleteBody", {
          entries: vm.deleteSummary.entries,
          operations: vm.deleteSummary.operations,
        })}${vm.archived ? "" : ` ${t("investment.asset.keepHistory")}`}`}
        onCancel={vm.onDeleteCancel}
        onConfirm={vm.onDeleteConfirm}
        testID={ids.deleteDialog}
        title={t("investment.asset.deleteTitle", { name: labelOf(asset) })}
        visible={vm.isDeleteOpen}
      />
      <Toast
        icon="lock-outline"
        message={t("family.archived.readOnly")}
        onHide={vm.onToastHide}
        visible={vm.toastVisible}
      />
    </Screen>
  );
}

export default Wide;
