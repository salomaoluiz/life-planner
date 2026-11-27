import { View } from "react-native";

import { ChipGroup } from "@components";
import { useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";

import { ActivityVM } from "../hooks";
import { ACTION_FILTERS, ALL, PERIODS } from "../models/activityFilters";
import useStyles from "../styles";
import activityTestIds from "../testIds";

interface Props {
  vm: ActivityVM;
}

// The filter chips (spec 127 section 8): when, action and, with a family, owner and author.
function FilterGroups({ vm }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();

  return (
    <View style={styles.toolbar}>
      <ChipGroup
        layout={"scroll"}
        mode={"single"}
        onChange={vm.onPeriodChange}
        options={PERIODS.map((period) => ({
          label: t(`activity.period.${period}` as TranslationKeys),
          value: period,
        }))}
        testID={activityTestIds.periodFilter}
        value={vm.filters.period}
      />
      <ChipGroup
        layout={"scroll"}
        mode={"single"}
        onChange={vm.onActionChange}
        options={[
          { label: t("activity.filter.all"), value: ALL },
          ...ACTION_FILTERS.map((action) => ({
            label: t(
              `activity.filter.action.${action.toLowerCase()}` as TranslationKeys,
            ),
            value: action,
          })),
        ]}
        testID={activityTestIds.actionFilter}
        value={vm.filters.action}
      />
      {vm.hasFamily ? (
        <>
          <ChipGroup
            layout={"scroll"}
            mode={"single"}
            onChange={vm.onOwnerChange}
            options={[
              { label: t("activity.filter.allOwners"), value: ALL },
              ...vm.ownerChoices,
            ]}
            testID={activityTestIds.ownerFilter}
            value={vm.filters.ownerId}
          />
          <ChipGroup
            layout={"scroll"}
            mode={"single"}
            onChange={vm.onActorChange}
            options={[
              { label: t("activity.filter.allOwners"), value: ALL },
              ...vm.actorChoices,
            ]}
            testID={activityTestIds.actorFilter}
            value={vm.filters.actorId}
          />
        </>
      ) : null}
    </View>
  );
}

export default FilterGroups;
