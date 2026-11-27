import { View } from "react-native";

import {
  AdaptiveViewProps,
  BottomSheet,
  Button,
  FilterButton,
  SearchField,
  SegmentedControl,
} from "@components";
import { useTranslation } from "@presentation/i18n";

import ActivityList from "../components/ActivityList";
import FilterGroups from "../components/FilterGroups";
import { ActivityVM } from "../hooks";
import useStyles from "../styles";
import activityTestIds from "../testIds";

// Mobile (spec 127 section 8): the module switch and the search on top, the filters in a bottom sheet.
function Compact({ vm }: AdaptiveViewProps<ActivityVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();

  return (
    <>
      <ActivityList
        header={
          <View style={styles.toolbar}>
            <SegmentedControl
              accessibilityLabel={t("activity.moduleA11y")}
              onChange={vm.onModuleChange}
              options={[
                { label: t("activity.module.finance"), value: "FINANCE" },
                { label: t("activity.module.investment"), value: "INVESTMENT" },
              ]}
              testID={activityTestIds.moduleSwitch}
              value={vm.module}
            />
            <SearchField
              clearLabel={t("common.actions.clear")}
              onChangeText={vm.onSearchChange}
              placeholder={t("activity.search")}
              testID={activityTestIds.search}
              value={vm.search}
            />
            <FilterButton
              accessibilityLabel={t("activity.filters")}
              count={vm.filterCount}
              label={t("activity.filters")}
              onPress={vm.onSheetOpen}
              testID={activityTestIds.filterButton}
            />
          </View>
        }
        vm={vm}
      />
      <BottomSheet
        closeLabel={t("activity.batch.close")}
        footer={
          <Button.Primary
            label={t("activity.filter.apply", {
              count: vm.days.reduce((sum, day) => sum + day.rows.length, 0),
            })}
            onPress={vm.onSheetClose}
          />
        }
        footerSecondary={
          <Button.Secondary
            label={t("activity.filter.clear")}
            onPress={vm.onClearFilters}
            testID={activityTestIds.clearFilters}
          />
        }
        onClose={vm.onSheetClose}
        testID={activityTestIds.filterSheet}
        title={t("activity.filters")}
        visible={vm.sheetOpen}
      >
        <FilterGroups vm={vm} />
      </BottomSheet>
    </>
  );
}

export default Compact;
