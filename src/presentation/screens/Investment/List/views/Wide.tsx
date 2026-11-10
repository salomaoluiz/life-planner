import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import {
  AdaptiveViewProps,
  Button,
  ChipGroup,
  EmptyState,
  ErrorState,
  GroupHeader,
  IconButton,
  ReadOnlyNotice,
  Screen,
  ScreenHeader,
  SearchField,
  SegmentedControl,
  StatusBanner,
  Text,
  Toast,
  useDensity,
} from "@components";
import Skeleton from "@components/Skeleton";
import { InvestmentAssetStatus } from "@domain/entities/investment/enums";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { translateChoices } from "@screens/Financial/models/ownerOptions";
import { INVESTMENT_MAX_WIDTH } from "@screens/Investment/constants";
import { ListEntry } from "@screens/Investment/models/assetList";
import { formatMoney, formatTime } from "@screens/Investment/models/format";
import investmentTestIds from "@screens/Investment/testIds";

import AssetRowItem from "../components/AssetRowItem";
import PendingMaturityCard from "../components/PendingMaturityCard";
import { InvestmentListVM } from "../hooks";
import useStyles from "../styles";

const SKELETON_ROWS = [0, 1, 2, 3, 4];

function ColumnsHeader() {
  const { styles } = useStyles();
  const { t } = useTranslation();

  return (
    <View style={styles.headerRow}>
      <View style={styles.cellAsset}>
        <Text.Overline
          tone="secondary"
          value={t("investment.list.columns.asset")}
        />
      </View>
      {(
        [
          ["quantity", styles.cellNumber],
          ["price", styles.cellNumber],
          ["today", styles.cellNumber],
          ["currentValue", styles.cellNumberWide],
          ["result", styles.cellNumberWide],
          ["updated", styles.cellUpdated],
        ] as const
      ).map(([key, style]) => (
        <View key={key} style={style}>
          <Text.Overline
            tone="secondary"
            value={t(`investment.list.columns.${key}`)}
          />
        </View>
      ))}
    </View>
  );
}

function Wide({ vm }: AdaptiveViewProps<InvestmentListVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const compact = useDensity().density === "compact";
  const archivedTab = vm.tab === InvestmentAssetStatus.ARCHIVED;
  const hasContent = !vm.isLoading && !vm.errorMessage && !vm.isEmpty;

  function renderItem({ item }: { item: ListEntry }) {
    if (item.kind === "group") {
      const current =
        item.current === null
          ? "—"
          : formatMoney(item.current, item.currency, localeTag);

      return (
        <GroupHeader
          meta={
            <Text.Caption
              tone="secondary"
              value={t("investment.list.groupSubtitle", {
                cost: formatMoney(item.cost, item.currency, localeTag),
                current,
              })}
            />
          }
          testID={investmentTestIds.list.group(item.key)}
          title={`${t(`investment.classGroup.${item.assetClass}`)} · ${item.currency}`}
        />
      );
    }

    return <AssetRowItem onPress={vm.onRowPress} row={item.row} />;
  }

  function renderEmpty() {
    if (vm.isLoading) {
      return (
        <View testID={investmentTestIds.list.skeleton}>
          {SKELETON_ROWS.map((key) => (
            <Skeleton.ListItem key={key} />
          ))}
        </View>
      );
    }

    if (vm.errorMessage) {
      return (
        <ErrorState
          message={t("investment.errors.generic")}
          onRetry={vm.onRetry}
          retryLabel={t("common.actions.tryAgain")}
        />
      );
    }

    if (vm.isEmpty) {
      return (
        <EmptyState
          actionLabel={
            vm.readOnly || archivedTab
              ? undefined
              : t("investment.list.newAsset")
          }
          icon="chart-line"
          message={
            archivedTab
              ? t("investment.list.emptyArchivedBody")
              : t("investment.list.emptyBody")
          }
          onAction={vm.readOnly || archivedTab ? undefined : vm.onAddPress}
          testID={investmentTestIds.list.emptyState}
          title={
            archivedTab
              ? t("investment.list.emptyArchivedTitle")
              : t("investment.list.emptyTitle")
          }
        />
      );
    }

    return (
      <View style={styles.noResults} testID={investmentTestIds.list.noResults}>
        <Text.Body align="center" value={t("investment.list.noResults")} />
        <Button.Ghost
          label={t("common.actions.clear")}
          onPress={() => vm.onSearchChange("")}
        />
      </View>
    );
  }

  return (
    <Screen
      list={
        <FlashList
          data={vm.entries}
          estimatedItemSize={compact ? 96 : 64}
          getItemType={(entry: ListEntry) => entry.kind}
          keyExtractor={(entry: ListEntry) => entry.key}
          ListEmptyComponent={renderEmpty()}
          ListFooterComponent={
            hasContent ? (
              <View style={styles.footnote}>
                <Text.Caption
                  testID={investmentTestIds.list.footnote}
                  tone="secondary"
                  value={t("investment.list.footnote")}
                />
              </View>
            ) : null
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          testID="flashList"
        />
      }
      maxWidth={INVESTMENT_MAX_WIDTH}
      onRefresh={vm.onRefresh}
      refreshing={vm.isRefreshing}
      testID={investmentTestIds.list.screen}
    >
      <View style={styles.header}>
        <ScreenHeader
          actions={
            vm.readOnly ? null : (
              <IconButton
                accessibilityLabel={t("investment.list.newAsset")}
                name="plus"
                onPress={vm.onAddPress}
                testID={investmentTestIds.list.addButton}
              />
            )
          }
          title={t("investment.list.title")}
        />
        {vm.hasQuotes ? (
          <View style={styles.headerTop}>
            {vm.quotesTime ? (
              <Text.Caption
                testID={investmentTestIds.list.quotesInfo}
                tone="secondary"
                value={`${t("investment.quote.asOf", {
                  time: formatTime(vm.quotesTime, localeTag),
                })} · ${t("investment.quote.everyHour")}`}
              />
            ) : null}
            <Button.Secondary
              disabled={vm.quotesDisabled}
              icon="refresh"
              label={
                vm.quotesRefreshing
                  ? t("investment.quote.refreshing")
                  : t("investment.quote.refreshNow")
              }
              loading={vm.quotesRefreshing}
              onPress={vm.onQuotesRefresh}
              testID={investmentTestIds.list.refreshQuotes}
            />
            {vm.quotesSecondsLeft > 0 ? (
              <Text.Caption
                accessibilityLiveRegion="polite"
                testID={investmentTestIds.list.refreshCountdown}
                tone="secondary"
                value={t("investment.quote.availableIn", {
                  seconds: vm.quotesSecondsLeft,
                })}
              />
            ) : null}
          </View>
        ) : null}
        {vm.quotesSourceDown ? (
          <StatusBanner
            message={t("investment.quote.sourceDown")}
            testID={investmentTestIds.list.sourceDownBanner}
          />
        ) : null}
        <ChipGroup
          layout="scroll"
          mode="single"
          onChange={vm.onOwnerFilterChange}
          options={translateChoices(vm.ownerChoices, t)}
          testID={investmentTestIds.list.ownerFilter}
          value={vm.ownerFilter}
        />
        <SegmentedControl
          accessibilityLabel={t("investment.list.title")}
          onChange={vm.onTabChange}
          options={[
            {
              label: t("investment.list.tabs.assets", {
                count: vm.assetsCount,
              }),
              value: InvestmentAssetStatus.ACTIVE,
            },
            {
              label: t("investment.list.tabs.archived", {
                count: vm.archivedCount,
              }),
              value: InvestmentAssetStatus.ARCHIVED,
            },
          ]}
          testID="investment.list.tabs"
          value={vm.tab}
        />
        {vm.hasAny ? (
          <SearchField
            clearLabel={t("common.actions.clear")}
            onChangeText={vm.onSearchChange}
            placeholder={t("investment.list.search")}
            testID={investmentTestIds.list.search}
            value={vm.search}
          />
        ) : null}
        {vm.readOnly ? (
          <ReadOnlyNotice
            message={t("family.archived.banner")}
            testID={investmentTestIds.list.readOnlyBanner}
          />
        ) : null}
        {vm.pendingAssets.map((asset) => (
          <PendingMaturityCard
            asset={asset}
            key={asset.id}
            onConfirm={vm.onConfirmMaturity}
            readOnly={vm.readOnly}
          />
        ))}
        {hasContent && !compact && vm.entries.length > 0 ? (
          <ColumnsHeader />
        ) : null}
      </View>
      <Toast
        icon="lock-outline"
        message={t("family.archived.readOnly")}
        onHide={vm.onToastHide}
        testID={investmentTestIds.list.readOnlyToast}
        visible={vm.toastVisible}
      />
    </Screen>
  );
}

export default Wide;
