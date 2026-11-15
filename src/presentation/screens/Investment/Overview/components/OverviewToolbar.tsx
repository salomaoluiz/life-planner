import { useState } from "react";
import { ScrollView, View } from "react-native";

import {
  BottomSheet,
  Button,
  ChipGroup,
  DateField,
  SegmentedControl,
  Text,
  Tooltip,
} from "@components";
import { IconButton } from "@components/Icon";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { translateChoices } from "@screens/Financial/models/ownerOptions";
import { formatDay } from "@screens/Financial/Overview/models/overviewFormat";
import { toDateKey } from "@screens/Financial/Transactions/models/transactionFilters";

import { InvestmentOverviewVM } from "../hooks/useInvestmentOverviewViewModel";
import {
  InvestmentsPeriod,
  InvestmentsPreset,
  validateCustomPeriod,
} from "../models/investmentsPeriod";
import useStyles from "../styles";
import overviewTestIds from "../testIds";

const PRESET_KEYS = {
  "1M": "investment.overview.period.preset.1M",
  "3M": "investment.overview.period.preset.3M",
  "6M": "investment.overview.period.preset.6M",
  "12M": "investment.overview.period.preset.12M",
  CUSTOM: "investment.overview.period.preset.CUSTOM",
  YEAR: "investment.overview.period.preset.YEAR",
} as const;

function CustomPeriodDialog(props: { vm: InvestmentOverviewVM }) {
  const { vm } = props;
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const [from, setFrom] = useState<Date | undefined>(toDate(vm.period.from));
  const [to, setTo] = useState<Date | undefined>(toDate(vm.period.to));
  const validation =
    from && to
      ? validateCustomPeriod(toDateKey(from), toDateKey(to), vm.today)
      : undefined;
  const error =
    validation && !validation.ok
      ? t("investment.overview.period.customInvalid")
      : undefined;
  const months = from && to ? monthsLabel(from, to, localeTag) : "";

  function apply() {
    if (from && to && validation?.ok) {
      const next: InvestmentsPeriod = {
        from: toDateKey(from),
        to: toDateKey(to),
      };

      vm.onCustomApply(next);
    }
  }

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      footer={
        <Button.Primary
          disabled={!validation?.ok}
          fullWidth
          label={t("common.actions.save")}
          onPress={apply}
        />
      }
      onClose={vm.onCustomClose}
      size="form"
      title={t("investment.overview.period.custom")}
      visible={vm.customOpen}
    >
      <View style={styles.stack}>
        <DateField
          label={t("financial.transactions.filters.period.from")}
          maxDate={to}
          onChange={setFrom}
          value={from}
        />
        <DateField
          label={t("financial.transactions.filters.period.to")}
          maxDate={toDate(vm.today)}
          onChange={setTo}
          value={to}
        />
        <Text.Caption
          tone={error ? "expense" : "secondary"}
          value={
            error ?? t("investment.overview.period.rangeMonths", { months })
          }
        />
      </View>
    </BottomSheet>
  );
}

function monthsLabel(from: Date, to: Date, localeTag: string): string {
  const months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth()) +
    1;

  return new Intl.NumberFormat(
    localeTag.startsWith("pt") ? "pt-BR" : "en-US",
  ).format(Math.max(1, months));
}

// Owner chips, the period presets and the arrows (artboard "Web · Visão geral de investimentos").
function OverviewToolbar(props: { vm: InvestmentOverviewVM }) {
  const { vm } = props;
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const presets = (
    <SegmentedControl
      accessibilityLabel={t("investment.overview.period.custom")}
      onChange={(value) => vm.onPresetChange(value as InvestmentsPreset)}
      options={vm.presets.map((value) => ({
        label: t(PRESET_KEYS[value]),
        value,
      }))}
      testID="investment.overview.period"
      value={vm.preset}
    />
  );
  const rangeLabel = t("investment.overview.period.range", {
    from: formatDay(vm.period.from, localeTag),
    to: formatDay(vm.period.to, localeTag),
  });
  const next = (
    <IconButton
      accessibilityLabel={t("financial.overview.period.next")}
      disabled={!vm.canGoNext}
      name="chevron-right"
      onPress={vm.onNext}
      testID={overviewTestIds.periodNext}
    />
  );

  return (
    <View style={styles.blocks}>
      <ChipGroup
        layout="scroll"
        mode="single"
        onChange={vm.onOwnerFilterChange}
        options={translateChoices(vm.ownerChoices, t)}
        testID="investment.overview.scope"
        value={vm.ownerFilter}
      />
      <View style={styles.period}>
        <View style={styles.presets}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            testID="investment.overview.period-scroll"
          >
            {presets}
          </ScrollView>
        </View>
        <View style={styles.arrows}>
          <IconButton
            accessibilityLabel={t("financial.overview.period.previous")}
            name="chevron-left"
            onPress={vm.onPrevious}
            testID={overviewTestIds.periodPrevious}
          />
          <View style={styles.range}>
            <Text.BodyStrong
              align="center"
              testID={overviewTestIds.periodRange}
              value={rangeLabel}
            />
          </View>
          {vm.canGoNext ? (
            next
          ) : (
            <Tooltip
              content={
                <Text.Caption
                  value={t("investment.overview.period.noFuture")}
                />
              }
              testID="investment.overview.period-limit-hint"
            >
              {next}
            </Tooltip>
          )}
        </View>
        {vm.preset === "CUSTOM" ? (
          <Button.Ghost
            label={t("investment.overview.period.custom")}
            onPress={vm.onCustomOpen}
          />
        ) : null}
      </View>
      <CustomPeriodDialog vm={vm} />
    </View>
  );
}
function toDate(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export default OverviewToolbar;
