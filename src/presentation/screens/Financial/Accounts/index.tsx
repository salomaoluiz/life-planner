import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import {
  AmountText,
  Card,
  ChipGroup,
  EmptyState,
  ErrorState,
  GroupHeader,
  Icon,
  IconButton,
  IconTile,
  ListItem,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import { useTranslation } from "@presentation/i18n";
import { translateChoices } from "@screens/Financial/models/ownerOptions";

import ProjectedBalance from "./components/ProjectedBalance";
import { useAccountsViewModel } from "./hooks";
import { AccountEntry } from "./models/accountList";
import useStyles from "./styles";
import accountsTestIds from "./testIds";

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

function FinancialAccounts() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { sizes } = useKitTheme();
  const vm = useAccountsViewModel();

  const toolbar = (
    <View style={styles.toolbar} testID="accounts-toolbar">
      <View style={styles.totalRow}>
        <View style={styles.totalColumn}>
          <Card testID={"accounts-total-card"}>
            <Text.Overline
              tone={"secondary"}
              value={t("financial.accounts.total")}
            />
            <AmountText
              currency={DEFAULT_CURRENCY}
              size={"heading"}
              testID={"accounts-total"}
              {...vm.totalAmount}
            />
            <Text.Caption
              tone={"secondary"}
              value={t("financial.accounts.totalProjected")}
            />
            <AmountText
              currency={DEFAULT_CURRENCY}
              size={"body"}
              testID={accountsTestIds.totalProjected}
              {...vm.totalProjectedAmount}
            />
          </Card>
        </View>
        <IconButton
          accessibilityLabel={t("financial.accounts.new")}
          name={"plus"}
          onPress={vm.onAddPress}
          testID={accountsTestIds.addButton}
        />
      </View>
      <ChipGroup
        layout={"scroll"}
        mode={"single"}
        onChange={vm.onOwnerFilterChange}
        options={translateChoices(vm.ownerChoices, t)}
        testID={accountsTestIds.ownerFilter}
        value={vm.ownerFilter}
      />
    </View>
  );

  function renderItem({ item }: { item: AccountEntry }) {
    if (item.kind === "section") {
      return <GroupHeader title={t(item.titleKey)} />;
    }

    if (item.kind === "archivedToggle") {
      return (
        <ListItem
          inset
          onPress={vm.onArchivedToggle}
          testID={accountsTestIds.archivedToggle}
          title={t("financial.accounts.archived", { count: item.count })}
          trailing={
            <Icon
              name={item.expanded ? "chevron-up" : "chevron-down"}
              size={sizes.iconMd}
            />
          }
        />
      );
    }

    const { account } = item;
    let tone: "accent" | "neutral" = "accent";
    if (account.isArchived) {
      tone = "neutral";
    }

    return (
      <ListItem
        inset
        leading={<IconTile name={account.icon} tone={tone} />}
        onPress={() => vm.onRowPress(account.id)}
        subtitle={account.ownerName}
        testID={accountsTestIds.row}
        title={account.name}
        trailing={
          <View style={styles.balanceColumn}>
            <AmountText
              currency={account.currency}
              {...account.balanceAmount}
              testID={`${accountsTestIds.row}-balance`}
            />
            {account.hasProjectedDifference && (
              <ProjectedBalance
                cents={account.projectedBalanceCents}
                currency={account.currency}
                testID={`${accountsTestIds.row}-projected`}
              />
            )}
          </View>
        }
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
      <View style={styles.root} testID={accountsTestIds.screen}>
        {toolbar}
        {SKELETON_ROWS.map((row) => (
          <Skeleton.ListItem key={row} testID={"accounts-skeleton"} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.root} testID={accountsTestIds.screen}>
      <FlashList
        data={vm.entries}
        estimatedItemSize={64}
        getItemType={(entry) => entry.kind}
        keyExtractor={(entry) => entry.key}
        ListEmptyComponent={
          <EmptyState
            actionLabel={t("financial.accounts.new")}
            message={t("financial.accounts.emptyMessage")}
            onAction={vm.onAddPress}
            testID={accountsTestIds.emptyState}
            title={t("financial.accounts.emptyTitle")}
          />
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

export default FinancialAccounts;
