import { View } from "react-native";

import { AdaptiveViewProps, SearchField, SegmentedControl } from "@components";
import { useTranslation } from "@presentation/i18n";

import ActivityList from "../components/ActivityList";
import FilterGroups from "../components/FilterGroups";
import { ActivityVM } from "../hooks";
import useStyles from "../styles";
import activityTestIds from "../testIds";

function Wide({ vm }: AdaptiveViewProps<ActivityVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();

  return (
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
          <FilterGroups vm={vm} />
        </View>
      }
      vm={vm}
    />
  );
}

export default Wide;
