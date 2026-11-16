import { View } from "react-native";

import { ChipGroup, SegmentedControl, useDensity } from "@components";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { translateChoices } from "@screens/Financial/models/ownerOptions";
import CustomPeriodSheet from "@screens/Financial/Overview/components/CustomPeriodSheet";
import PeriodArrows from "@screens/Financial/Overview/components/PeriodArrows";
import { formatDay } from "@screens/Financial/Overview/models/overviewFormat";

import { InvestmentOverviewVM } from "../hooks";
import { validateCustomPeriod } from "../models/investmentPeriod";
import useStyles from "../styles";
import overviewTestIds from "../testIds";

const PRESETS = ["1M", "3M", "6M", "12M", "YEAR", "CUSTOM"] as const;
const PRESET_KEYS = {
  "1M": "financial.overview.period.1m",
  "3M": "financial.overview.period.3m",
  "6M": "financial.overview.period.6m",
  "12M": "financial.overview.period.12m",
  CUSTOM: "financial.overview.period.custom",
  YEAR: "financial.overview.period.year",
} as const;

// Spec 110 FR 2-5: the owner chips, the finance period selector (presets, arrows, Today, custom dialog) and the
// "no future" hint on the disabled arrow.
function OverviewToolbar(props: { vm: InvestmentOverviewVM }) {
  const { vm } = props;
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const compact = useDensity().density === "compact";
  const rangeLabel = `${formatDay(vm.period.from, localeTag)} – ${formatDay(vm.period.to, localeTag)}`;

  return (
    <View style={styles.toolbar}>
      <ChipGroup
        layout="scroll"
        mode="single"
        onChange={vm.onOwnerFilterChange}
        options={translateChoices(vm.ownerChoices, t)}
        testID={overviewTestIds.ownerFilter}
        value={vm.ownerFilter}
      />
      <View style={styles.period}>
        <View style={styles.presets}>
          <SegmentedControl
            accessibilityLabel={t("financial.overview.period.custom")}
            onChange={vm.onPresetChange}
            onSelectedPress={vm.onPresetReselect}
            options={PRESETS.map((value) => ({
              label: t(PRESET_KEYS[value]),
              value,
            }))}
            testID="investment.overview.period"
            value={vm.preset}
          />
        </View>
        <PeriodArrows
          canGoNext={vm.canGoNext}
          compact={compact}
          hint={t("investment.overview.period.noFuture")}
          limitDate={formatDay(vm.today, localeTag)}
          onBackToToday={vm.onBackToToday}
          onNext={vm.onNextPeriod}
          onPrevious={vm.onPreviousPeriod}
          rangeLabel={rangeLabel}
          showToday={vm.showToday}
          testIDs={{
            limitHint: overviewTestIds.periodLimitHint,
            next: overviewTestIds.periodNext,
            previous: overviewTestIds.periodPrevious,
            range: overviewTestIds.periodRange,
            today: overviewTestIds.periodToday,
          }}
        />
      </View>
      {vm.customOpen ? (
        <CustomPeriodSheet
          errorText={(date) =>
            t("investment.overview.period.error", {
              date: formatDay(date, localeTag),
            })
          }
          hint={t("investment.overview.period.customHint")}
          initial={vm.customInitial}
          maxDate={vm.today}
          onApply={vm.onApplyCustomPeriod}
          onClose={vm.onCustomClose}
          testIdPrefix={overviewTestIds.customPrefix}
          today={vm.today}
          validate={validateCustomPeriod}
        />
      ) : null}
    </View>
  );
}

export default OverviewToolbar;
