import { View } from "react-native";

import { ChipGroup, Screen, ScreenHeader } from "@components";
import { useTranslation } from "@presentation/i18n";
import ProfileButton from "@screens/Navigation/containers/ProfileButton";

import LatestTransactions from "./components/LatestTransactions";
import MonthSummaryCard from "./components/MonthSummaryCard";
import StockAttentionCard from "./components/StockAttentionCard";
import { useHomeViewModel } from "./hooks";
import useStyles from "./styles";

// Home has two columns on wide screens, so it is wider than the 720 default.
const HOME_MAX_WIDTH = 960;

function Home() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const vm = useHomeViewModel();

  return (
    <Screen
      maxWidth={HOME_MAX_WIDTH}
      onRefresh={vm.onRefresh}
      refreshing={vm.isRefreshing}
      scroll
      testID="home"
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
          label: option.labelKey ? t(option.labelKey) : (option.label ?? ""),
          value: option.value,
        }))}
        testID="home-filter"
        value={vm.filter.value}
      />
      <View style={vm.isSplitLayout ? styles.split : styles.stack}>
        <View style={vm.isSplitLayout ? styles.column : undefined}>
          <MonthSummaryCard onPress={vm.onSummaryPress} state={vm.summary} />
        </View>
        <View style={vm.isSplitLayout ? styles.column : undefined}>
          <StockAttentionCard
            onAddItemPress={vm.onAddStockItemPress}
            onSeeAllPress={vm.onStockSeeAllPress}
            state={vm.stock}
          />
        </View>
      </View>
      <LatestTransactions
        onAddPress={vm.onAddTransactionPress}
        onSeeAllPress={vm.onTransactionsSeeAllPress}
        state={vm.transactions}
      />
    </Screen>
  );
}

export default Home;
