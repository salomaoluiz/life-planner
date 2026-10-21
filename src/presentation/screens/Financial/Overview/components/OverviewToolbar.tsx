import { View } from "react-native";

import { ChipGroup, SegmentedControl, SelectField, Text } from "@components";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { translateChoices } from "@screens/Financial/models/ownerOptions";
import FilterToolbar from "@screens/Financial/Transactions/components/FilterToolbar";
import useFilterOptions from "@screens/Financial/Transactions/hooks/useFilterOptions";
import { buildActiveChips } from "@screens/Financial/Transactions/models/filterLabels";

import { OverviewViewModel } from "../hooks/useOverviewViewModel";
import { formatDay } from "../models/overviewFormat";
import useStyles from "../styles";
import overviewTestIds from "../testIds";

const PRESETS = ["3M", "6M", "12M", "YEAR", "CUSTOM"] as const;
const PRESET_KEYS = {
  "3M": "financial.overview.period.3m",
  "6M": "financial.overview.period.6m",
  "12M": "financial.overview.period.12m",
  CUSTOM: "financial.overview.period.custom",
  YEAR: "financial.overview.period.year",
} as const;

// Scope, period, currency, search and the Filters button (spec 046 FR 3).
function OverviewToolbar(props: { vm: OverviewViewModel }) {
  const { vm } = props;
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const filterOptions = useFilterOptions(vm.allOwnerIds, vm.filtersActive);
  const chips = buildActiveChips(
    vm.filterStore.filters,
    {
      categories: new Map(
        filterOptions.categoryDtos.map((item) => [item.id, item.name]),
      ),
      sources: new Map(
        filterOptions.sources.map((item) => [item.id, item.name]),
      ),
      tags: new Map(filterOptions.tags.map((item) => [item.id, item.name])),
    },
    localeTag,
    t,
  );
  const count = chips.length;
  const scopeOptions = translateChoices(vm.ownerChoices, t);
  const showCurrency = vm.currencies.length > 1;

  return (
    <View style={styles.toolbar}>
      <View accessibilityLabel={t("financial.transactions.scope.label")}>
        <ChipGroup
          layout="scroll"
          mode="single"
          onChange={vm.onOwnerFilterChange}
          options={scopeOptions}
          testID="financial.overview.scope"
          value={vm.ownerFilter}
        />
      </View>
      <View style={styles.period}>
        <SegmentedControl
          accessibilityLabel={t("financial.overview.period.custom")}
          onChange={vm.onPresetChange}
          options={PRESETS.map((value) => ({
            label: t(PRESET_KEYS[value]),
            value,
          }))}
          testID="financial.overview.period"
          value={vm.preset}
        />
        <Text.Caption
          tone="secondary"
          value={`${formatDay(vm.period.from, localeTag)} – ${formatDay(vm.period.to, localeTag)}`}
        />
        {showCurrency ? (
          <SelectField
            closeLabel={t("common.actions.close")}
            label={t("financial.overview.currency")}
            onChange={vm.onCurrencyChange}
            options={vm.currencies.map((option) => ({
              description: t("financial.overview.currencyOption", {
                accounts: String(option.accounts),
                cards: String(option.cards),
              }),
              label: option.code,
              value: option.code,
            }))}
            sheetTitle={t("financial.overview.currency")}
            testID={overviewTestIds.currency}
            value={vm.currency}
          />
        ) : null}
      </View>
      <FilterToolbar
        chips={chips}
        clearAllLabel={t("financial.transactions.filters.clearAll")}
        count={count}
        filtersA11y={t("financial.transactions.filters.a11y", { count })}
        filtersLabel={t("financial.transactions.filters.button")}
        filtersTestID={overviewTestIds.filtersButton}
        onChipRemove={vm.filterStore.removeGroup}
        onClearAll={vm.filterStore.clearAll}
        onFiltersPress={vm.onFiltersOpen}
        onSearchChange={vm.filterStore.setSearch}
        removeLabel={(name) =>
          t("financial.transactions.filters.remove", { name })
        }
        searchClearLabel={t("common.actions.clear")}
        searchPlaceholder={t(
          "financial.transactions.filters.searchPlaceholder",
        )}
        searchTestID={overviewTestIds.search}
        searchValue={vm.filterStore.filters.search}
      />
    </View>
  );
}

export default OverviewToolbar;
