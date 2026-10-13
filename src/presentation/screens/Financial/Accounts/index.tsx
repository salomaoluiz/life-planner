import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import {
  AmountText,
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
import { useTranslation } from "@presentation/i18n";
import { translateChoices } from "@screens/Financial/models/ownerOptions";

import { useAccountsViewModel } from "./hooks";
import { AccountEntry } from "./models/accountList";
import useStyles from "./styles";

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

function FinancialAccounts() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { sizes } = useKitTheme();
  const vm = useAccountsViewModel();

  const toolbar = (
    <View style={styles.toolbar}>
      <View style={styles.totalRow}>
        <View style={styles.totalColumn}>
          <Text.Caption
            tone={"secondary"}
            value={t("financial.accounts.total")}
          />
          <AmountText
            size={"heading"}
            testID={"accounts-total"}
            {...vm.totalAmount}
          />
        </View>
        <IconButton
          accessibilityLabel={t("financial.accounts.new")}
          name={"plus"}
          onPress={vm.onAddPress}
        />
      </View>
      <ChipGroup
        layout={"scroll"}
        mode={"single"}
        onChange={vm.onOwnerFilterChange}
        options={translateChoices(vm.ownerChoices, t)}
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
          onPress={vm.onArchivedToggle}
          testID={"archived-toggle"}
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
        leading={<IconTile name={account.icon} tone={tone} />}
        onPress={() => vm.onRowPress(account.id)}
        subtitle={account.ownerName}
        testID={`account-row-${account.id}`}
        title={account.name}
        trailing={<AmountText {...account.balanceAmount} />}
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
      <View style={styles.root}>
        {toolbar}
        {SKELETON_ROWS.map((row) => (
          <Skeleton.ListItem key={row} testID={"accounts-skeleton"} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.root}>
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
            title={t("financial.accounts.emptyTitle")}
          />
        }
        ListHeaderComponent={toolbar}
        onRefresh={vm.onRefresh}
        refreshing={vm.isRefreshing}
        renderItem={renderItem}
      />
    </View>
  );
}

export default FinancialAccounts;
