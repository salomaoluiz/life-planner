import { StyleSheet, View } from "react-native";

import { Button, FilterButton, RemovableChip, SearchField } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { ActiveFilterChip } from "@screens/Financial/Transactions/models/filterLabels";
import { FilterGroup } from "@screens/Financial/Transactions/models/transactionFilters";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

interface Props {
  chips: ActiveFilterChip[];
  clearAllLabel: string;
  count: number;
  filtersA11y: string;
  filtersLabel: string;
  filtersTestID?: string;
  // Wide layouts put it (the scope chips) at the start of the same row as the search.
  leading?: React.ReactNode;
  onChipRemove: (group: FilterGroup) => void;
  onClearAll: () => void;
  onFiltersPress: () => void;
  onSearchChange: (text: string) => void;
  removeLabel: (label: string) => string;
  searchClearLabel: string;
  searchPlaceholder: string;
  // The overview (spec 046) has its own ids.
  searchTestID?: string;
  searchValue: string;
}

// Search, the Filters button with the number of active groups, and one removable chip per group (spec 045 FR 10-11).
function FilterToolbar(props: Props) {
  const { breakpoint, spacing } = useKitTheme();
  const wide = breakpoint !== "compact";
  const styles = StyleSheet.create({
    chips: {
      alignItems: "center",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
    },
    grow: { flexGrow: 1 },
    leading: { flexShrink: 1 },
    root: { gap: spacing.sm },
    row: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.sm,
      justifyContent: "flex-end",
    },
    search: { flexGrow: 1, flexShrink: 1, maxWidth: 360 },
  });

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        {wide && props.leading ? (
          <View style={[styles.leading, styles.grow]}>{props.leading}</View>
        ) : null}
        <View style={styles.search}>
          <SearchField
            clearLabel={props.searchClearLabel}
            onChangeText={props.onSearchChange}
            placeholder={props.searchPlaceholder}
            testID={props.searchTestID ?? transactionsTestIds.search}
            value={props.searchValue}
          />
        </View>
        <FilterButton
          accessibilityLabel={props.filtersA11y}
          count={props.count}
          iconOnly={!wide}
          label={props.filtersLabel}
          onPress={props.onFiltersPress}
          testID={props.filtersTestID ?? transactionsTestIds.filtersButton}
        />
      </View>
      {props.chips.length > 0 ? (
        <View style={styles.chips}>
          {props.chips.map((chip) => (
            <RemovableChip
              key={chip.group}
              label={chip.label}
              onRemove={() => props.onChipRemove(chip.group)}
              removeLabel={props.removeLabel(chip.label)}
              testID={`${transactionsTestIds.activeFilter}-${chip.group}`}
            />
          ))}
          <Button.Ghost
            inline
            label={props.clearAllLabel}
            onPress={props.onClearAll}
            testID={transactionsTestIds.clearFilters}
          />
        </View>
      ) : null}
    </View>
  );
}

export default FilterToolbar;
