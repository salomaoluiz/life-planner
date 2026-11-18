import { View } from "react-native";

import {
  AdaptiveViewProps,
  AmountText,
  Badge,
  Button,
  Card,
  ChipGroup,
  EmptyState,
  ErrorState,
  ReadOnlyNotice,
  Screen,
  Text,
  Toast,
} from "@components";
import Skeleton from "@components/Skeleton";
import { toCurrencyCode } from "@domain/entities/financial/Currency";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import SectionHeader from "@screens/Stock/Layout/components/SectionHeader";

import { StockListsVM } from "../hooks";
import { ShoppingListCardView } from "../models/ShoppingListsUIModel";
import useStyles from "../styles";
import stockListsTestIds from "../testIds";

function Wide({ vm }: AdaptiveViewProps<StockListsVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();

  function renderCard(card: ShoppingListCardView) {
    return (
      <View key={card.id} style={styles.gridItem}>
        <Card
          accessibilityLabel={card.name}
          onPress={() => vm.onCardPress(card.id)}
          testID={`${stockListsTestIds.card}-${card.id}`}
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <Text.Heading value={card.name} />
                {card.ownerName ? (
                  <Text.Caption value={card.ownerName} />
                ) : null}
              </View>
              {card.isDefault ? (
                <Badge
                  label={t("stock.lists.default")}
                  testID={stockListsTestIds.cardDefault}
                  tone="accent"
                />
              ) : null}
            </View>
            <View style={styles.cardMeta}>
              <Text.Body
                value={t(pluralKey("stock.lists.itemsCount", card.rowCount), {
                  count: card.rowCount,
                })}
              />
              {card.rowCount > 0 ? (
                <Text.Body
                  testID={stockListsTestIds.cardAuto}
                  tone="secondary"
                  value={
                    card.autoCount > 0
                      ? t(pluralKey("stock.lists.autoCount", card.autoCount), {
                          count: card.autoCount,
                        })
                      : t("stock.lists.noAuto")
                  }
                />
              ) : null}
            </View>
            {renderEstimate(card)}
          </View>
        </Card>
      </View>
    );
  }

  function renderEstimate(card: ShoppingListCardView) {
    if (card.rowCount === 0) {
      return <Text.Body tone="secondary" value={t("stock.lists.empty")} />;
    }

    if (card.pricedCount === 0) {
      return (
        <>
          <Text.Display value="—" />
          <Text.Caption value={t("stock.lists.noPriceYet")} />
        </>
      );
    }

    return (
      <>
        <AmountText
          currency={toCurrencyCode(card.currency)}
          size="display"
          testID={`${stockListsTestIds.cardTotal}-${card.id}`}
          value={card.estimatedTotalCents}
        />
        <Text.Caption
          value={t("stock.lists.coverage", {
            priced: card.pricedCount,
            total: card.rowCount,
          })}
        />
      </>
    );
  }

  function renderBody() {
    if (vm.isLoading) {
      return (
        <View style={styles.grid} testID={stockListsTestIds.loading}>
          {[0, 1, 2].map((key) => (
            <View key={key} style={styles.gridItem}>
              <Skeleton.Card />
            </View>
          ))}
        </View>
      );
    }

    if (vm.errorMessageKey) {
      return (
        <ErrorState
          message={t(vm.errorMessageKey)}
          onRetry={vm.onRetry}
          retryLabel={t("common.actions.tryAgain")}
          testID={stockListsTestIds.error}
        />
      );
    }

    if (vm.isEmpty) {
      return (
        <EmptyState
          message={t("stock.lists.empty")}
          testID={stockListsTestIds.empty}
          title={t("stock.lists.title")}
        />
      );
    }

    return (
      <>
        <View style={styles.grid}>{vm.activeCards.map(renderCard)}</View>
        {vm.archivedCards.length > 0 ? (
          <Card testID={stockListsTestIds.archived}>
            <Button.Ghost
              label={t("stock.lists.archived", {
                count: vm.archivedCards.length,
              })}
              onPress={vm.onArchivedToggle}
              testID={stockListsTestIds.archivedToggle}
            />
            {vm.archivedOpen
              ? vm.archivedCards.map((card) => (
                  <View key={card.id} style={styles.archivedRow}>
                    <Text.Body
                      value={
                        card.ownerName
                          ? `${card.name} · ${card.ownerName}`
                          : card.name
                      }
                    />
                    <Button.Secondary
                      label={t("stock.lists.reactivate")}
                      onPress={() => vm.onReactivate(card.id)}
                      testID={`${stockListsTestIds.reactivate}-${card.id}`}
                    />
                  </View>
                ))
              : null}
          </Card>
        ) : null}
      </>
    );
  }

  return (
    <Screen
      onRefresh={vm.onRefresh}
      refreshing={vm.isRefreshing}
      scroll
      testID={stockListsTestIds.screen}
    >
      <View style={styles.screen}>
        <View style={styles.header}>
          <SectionHeader
            actions={
              vm.readOnly ? null : (
                <Button.Primary
                  label={t("stock.lists.new")}
                  onPress={vm.onNewPress}
                  testID={stockListsTestIds.newButton}
                />
              )
            }
            section="lists"
          />
          {vm.filterOptions.length > 2 ? (
            <ChipGroup
              layout="scroll"
              mode="single"
              onChange={vm.onFilterChange}
              options={vm.filterOptions.map((option) => ({
                label: option.labelKey
                  ? t(option.labelKey)
                  : (option.label ?? ""),
                value: option.value,
              }))}
              testID={stockListsTestIds.filter}
              value={vm.filter}
            />
          ) : null}
          {vm.readOnly ? (
            <ReadOnlyNotice
              message={t("family.archived.banner")}
              testID={stockListsTestIds.readOnlyBanner}
            />
          ) : null}
        </View>
        {renderBody()}
      </View>
      <Toast
        icon={"lock-outline"}
        message={
          vm.reactivateFailed
            ? t("common.errors.generic")
            : t("family.archived.readOnly")
        }
        onHide={vm.onToastHide}
        visible={vm.toastVisible || vm.reactivateFailed}
      />
    </Screen>
  );
}

export default Wide;
