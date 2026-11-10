import { View } from "react-native";

import {
  AdaptiveViewProps,
  ChipGroup,
  Screen,
  ScreenHeader,
  Section,
  SelectField,
} from "@components";
import { useTranslation } from "@presentation/i18n";
import ProfileButton from "@screens/Navigation/containers/ProfileButton";

import FinanceBalanceCard from "../components/FinanceBalanceCard";
import LowestBalanceTiles from "../components/LowestBalanceTiles";
import StockAttentionListCard from "../components/StockAttentionListCard";
import StockSummaryCard from "../components/StockSummaryCard";
import UpcomingList from "../components/UpcomingList";
import { HomeVM } from "../hooks";
import useStyles from "../styles";
import homeTestIds from "../testIds";

// Home has two columns on wide screens, so it is wider than the 720 default.
const HOME_MAX_WIDTH = 960;

function Wide({ vm }: AdaptiveViewProps<HomeVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const rowStyle = vm.isSplitLayout ? styles.split : styles.stack;
  const columnStyle = vm.isSplitLayout ? styles.column : undefined;

  return (
    <Screen
      maxWidth={HOME_MAX_WIDTH}
      onRefresh={vm.onRefresh}
      refreshing={vm.isRefreshing}
      scroll
      testID={homeTestIds.screen}
    >
      <ScreenHeader
        actions={
          <ProfileButton
            name={vm.header.avatarName}
            photoUrl={vm.header.avatarPhotoUrl}
          />
        }
        overline={vm.header.overline}
        title={t(vm.header.greetingKey, vm.header.greetingParams)}
      />
      <ChipGroup
        mode="single"
        onChange={vm.filter.onChange}
        options={vm.filter.options.map((option) => ({
          icon: option.archived ? "archive-outline" : undefined,
          label: option.labelKey ? t(option.labelKey) : (option.label ?? ""),
          value: option.value,
        }))}
        testID="home-filter"
        value={vm.filter.value}
      />
      <Section
        actionInset
        actionLabel={t("home.finance.overview")}
        onActionPress={vm.onOverviewPress}
        testID={homeTestIds.financeSection}
        title={t("home.finance.title")}
      >
        {vm.currency.visible ? (
          <SelectField
            closeLabel={t("common.actions.close")}
            label={t("home.finance.currency")}
            onChange={vm.currency.onChange}
            options={vm.currency.options.map((code) => ({
              label: t(`financial.accounts.currencyOption.${code}`),
              value: code,
            }))}
            sheetTitle={t("home.finance.currency")}
            testID={homeTestIds.financeCurrency}
            value={vm.currency.value}
          />
        ) : null}
        <View style={rowStyle}>
          <View style={[columnStyle, styles.stack]}>
            <FinanceBalanceCard
              currency={vm.currency.value}
              onPress={vm.onOverviewPress}
              state={vm.balance}
            />
            <LowestBalanceTiles
              currency={vm.currency.value}
              onCreateAccountPress={vm.onCreateAccountPress}
              onPress={vm.onOverviewPress}
              state={vm.lowest}
            />
          </View>
          <View style={columnStyle}>
            <UpcomingList
              fill={vm.isSplitLayout}
              onAddTransactionPress={vm.onAddTransactionPress}
              onInvoicePress={vm.onInvoicePress}
              onItemPress={vm.onUpcomingItemPress}
              onSeeAllPress={vm.onUpcomingSeeAllPress}
              state={vm.upcoming}
            />
          </View>
        </View>
      </Section>
      <Section
        actionInset
        actionLabel={t("home.stock.seeAll")}
        onActionPress={vm.onStockSeeAllPress}
        testID={homeTestIds.stockSection}
        title={t("home.stock.title")}
      >
        <View style={rowStyle}>
          <View style={columnStyle}>
            <StockSummaryCard fill={vm.isSplitLayout} state={vm.stock} />
          </View>
          <View style={columnStyle}>
            <StockAttentionListCard
              fill={vm.isSplitLayout}
              onAddItemPress={vm.onAddStockItemPress}
              onRowPress={vm.onStockSeeAllPress}
              state={vm.stock}
            />
          </View>
        </View>
      </Section>
    </Screen>
  );
}

export default Wide;
