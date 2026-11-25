import { View } from "react-native";

import {
  AdaptiveViewProps,
  BarList,
  Card,
  ChipGroup,
  EmptyState,
  ErrorState,
  IconButton,
  Screen,
  SegmentedControl,
  StatTile,
  Text,
  useDensity,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { TranslationKeys } from "@presentation/i18n/types";
import SectionHeader from "@screens/Stock/Layout/components/SectionHeader";

import { StockWasteVM } from "../hooks";
import { WASTE_OWNER_ALL, WasteBarRow } from "../models/WasteUIModel";
import useStyles from "../styles";
import stockWasteTestIds from "../testIds";

function Wide({ vm }: AdaptiveViewProps<StockWasteVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { density } = useDensity();
  const compact = density === "compact";
  const { model } = vm;

  function rows(list: WasteBarRow[], translate: boolean) {
    return list.map((row) => ({
      id: row.id,
      label: translate
        ? t(
            (row.label
              ? `stock.waste.reason.${row.label.toLowerCase()}`
              : "stock.waste.noCategory") as TranslationKeys,
          )
        : row.label || t("stock.waste.noCategory"),
      percent: row.percent,
      ratio: row.ratio,
      value: row.value,
    }));
  }

  function renderControls() {
    return (
      <View style={styles.controls}>
        <View style={styles.monthSwitch}>
          <IconButton
            accessibilityLabel={t("stock.waste.previousMonth")}
            disabled={!model?.canGoPrevious}
            name="chevron-left"
            onPress={vm.onMonthPrevious}
            testID={stockWasteTestIds.previousMonth}
          />
          <Text.BodyStrong
            testID={stockWasteTestIds.month}
            value={model?.monthLabel ?? ""}
          />
          <IconButton
            accessibilityLabel={t("stock.waste.nextMonth")}
            disabled={!model?.canGoNext}
            name="chevron-right"
            onPress={vm.onMonthNext}
            testID={stockWasteTestIds.nextMonth}
          />
        </View>
        <ChipGroup
          label={t("stock.lists.owner")}
          mode="single"
          onChange={vm.onOwnerChange}
          options={[
            { label: t("stock.waste.owners.all"), value: WASTE_OWNER_ALL },
            ...vm.ownerOptions.map((owner) => ({
              label: owner.isUser
                ? t("stock.waste.owners.personal")
                : owner.name,
              value: owner.id,
            })),
          ]}
          testID={stockWasteTestIds.owner}
          value={vm.ownerId}
        />
      </View>
    );
  }

  function renderTiles() {
    if (!model) {
      return null;
    }

    const delta = model.delta;

    return (
      <View style={styles.tiles}>
        <View style={styles.tile}>
          <StatTile
            delta={
              delta
                ? { text: t(delta.key, delta.params), tone: delta.tone }
                : undefined
            }
            label={t("stock.waste.total")}
            testID={stockWasteTestIds.total}
            value={model.totalValues.join(" · ") || "—"}
          />
        </View>
        <View style={styles.tile}>
          <StatTile
            delta={{
              text: t(
                pluralKey("stock.waste.distinctItems", model.distinctItems),
                {
                  count: model.distinctItems,
                },
              ),
              tone: "neutral",
            }}
            label={t("stock.waste.discards")}
            testID={stockWasteTestIds.discards}
            value={String(model.discardCount)}
          />
        </View>
        <View style={styles.tile}>
          <StatTile
            delta={{ text: t("stock.waste.unpricedHint"), tone: "neutral" }}
            label={t("stock.waste.unpriced")}
            testID={stockWasteTestIds.unpriced}
            value={String(model.unpricedCount)}
          />
        </View>
      </View>
    );
  }

  function renderItems() {
    if (!model) {
      return null;
    }

    return (
      <Card testID={stockWasteTestIds.topItems}>
        <Text.Heading value={t("stock.waste.topItems")} />
        {model.topItems.map((item) => (
          <View
            key={item.id}
            style={styles.itemRow}
            testID={stockWasteTestIds.topItem}
          >
            <View style={styles.itemInfo}>
              <Text.BodyStrong value={item.name} />
              <Text.Caption
                value={[
                  `${item.detail.quantity.text} ${t(item.detail.quantity.unitKey)}`,
                  t(pluralKey("stock.waste.discardCount", item.detail.count), {
                    count: item.detail.count,
                  }),
                  t(item.reasonKey),
                ].join(" · ")}
              />
            </View>
            <Text.BodyStrong value={item.value || t("stock.waste.unpriced")} />
          </View>
        ))}
        {model.moreItemsCount > 0 ? (
          <Card
            accessibilityLabel={t("stock.waste.moreItems", {
              count: model.moreItemsCount,
            })}
            onPress={vm.onShowAll}
            testID={stockWasteTestIds.moreItems}
          >
            <Text.BodyStrong
              value={t("stock.waste.moreItems", {
                count: model.moreItemsCount,
              })}
            />
          </Card>
        ) : null}
      </Card>
    );
  }

  function renderReason() {
    return (
      <Card testID={stockWasteTestIds.byReason}>
        <Text.Heading value={t("stock.waste.byReason")} />
        <BarList rows={rows(model?.byReason ?? [], true)} tone="expense" />
      </Card>
    );
  }

  function renderCategory() {
    return (
      <Card testID={stockWasteTestIds.byCategory}>
        <Text.Heading value={t("stock.waste.byCategory")} />
        <BarList rows={rows(model?.byCategory ?? [], false)} tone="expense" />
      </Card>
    );
  }

  function renderBlocks() {
    if (!model) {
      return null;
    }

    if (compact) {
      return (
        <>
          <SegmentedControl
            accessibilityLabel={t("stock.waste.tabsLabel")}
            onChange={vm.onTabChange}
            options={[
              { label: t("stock.waste.tabs.reason"), value: "reason" },
              { label: t("stock.waste.tabs.category"), value: "category" },
              { label: t("stock.waste.tabs.items"), value: "items" },
            ]}
            testID={stockWasteTestIds.tabs}
            value={vm.tab}
          />
          {vm.tab === "reason" ? renderReason() : null}
          {vm.tab === "category" ? renderCategory() : null}
          {vm.tab === "items" ? renderItems() : null}
        </>
      );
    }

    return (
      <>
        <View style={styles.blocks}>
          <View style={styles.block}>{renderReason()}</View>
          <View style={styles.block}>{renderCategory()}</View>
        </View>
        {renderItems()}
      </>
    );
  }

  function renderBody() {
    if (vm.isLoading) {
      return <Skeleton.ListItem testID={stockWasteTestIds.loading} />;
    }

    if (vm.errorKey) {
      return (
        <ErrorState
          message={t(vm.errorKey)}
          onRetry={vm.onRetry}
          retryLabel={t("common.actions.tryAgain")}
          testID={stockWasteTestIds.error}
        />
      );
    }

    if (model?.isEmpty) {
      return (
        <EmptyState
          icon="delete-empty-outline"
          message={t("stock.waste.emptyHint")}
          testID={stockWasteTestIds.empty}
          title={t("stock.waste.empty")}
        />
      );
    }

    return (
      <>
        {renderTiles()}
        {renderBlocks()}
      </>
    );
  }

  return (
    <Screen scroll testID={stockWasteTestIds.screen}>
      <View style={styles.screen}>
        <SectionHeader section="waste" />
        {renderControls()}
        {renderBody()}
      </View>
    </Screen>
  );
}

export default Wide;
