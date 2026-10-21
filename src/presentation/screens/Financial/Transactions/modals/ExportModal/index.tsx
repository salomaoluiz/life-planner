import { View } from "react-native";

import {
  BottomSheet,
  Button,
  Card,
  Checkbox,
  ChipGroup,
  DateField,
  FormColumns,
  Icon,
  ListItem,
  Text,
} from "@components";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { translateChoices } from "@screens/Financial/models/ownerOptions";
import { SourceOption } from "@screens/Financial/Transactions/hooks/useFilterOptions";
import { ExportPreset } from "@screens/Financial/Transactions/models/exportCsv";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";
import { isWeb } from "@utils/platform";

import useStyles from "./styles";
import useExportModalViewModel, {
  ExportModalParams,
} from "./useExportModalViewModel";

const PRESET_KEYS = {
  LAST_12_MONTHS: "financial.export.period.last12Months",
  THIS_MONTH: "financial.export.period.thisMonth",
  THIS_YEAR: "financial.export.period.thisYear",
} as const;
const ids = transactionsTestIds;

// The Export CSV modal (spec 047 FR 2-4): two columns on web/tablet, a compact sheet on mobile.
function ExportModal(props: ExportModalParams) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const vm = useExportModalViewModel(props);

  function sectionTitle(text: string) {
    return <Text.BodyStrong value={text} />;
  }

  function periodSection() {
    return (
      <View style={styles.section}>
        {sectionTitle(t("financial.export.period.title"))}
        <View style={styles.dates}>
          <View style={styles.date}>
            <DateField
              label={t("financial.export.period.from")}
              maxDate={vm.customTo}
              onChange={vm.onFromChange}
              testID={ids.exportFrom}
              value={vm.customFrom}
            />
          </View>
          <View style={styles.date}>
            <DateField
              label={t("financial.export.period.to")}
              minDate={vm.customFrom}
              onChange={vm.onToChange}
              testID={ids.exportTo}
              value={vm.customTo}
            />
          </View>
        </View>
        <ChipGroup
          mode={"single"}
          onChange={(value) => vm.onPresetChange(value as ExportPreset)}
          options={vm.presets.map((preset) => ({
            label: t(PRESET_KEYS[preset]),
            value: preset,
          }))}
          testID={ids.exportPreset}
          value={vm.preset}
        />
        {vm.periodError ? (
          <View accessibilityRole={"alert"}>
            <Text.Caption
              testID={ids.exportPeriodError}
              tone={"expense"}
              value={t(
                "financial.transactions.filters.period.error",
                vm.periodError,
              )}
            />
          </View>
        ) : (
          <Text.Caption
            tone={"secondary"}
            value={t("financial.export.period.help")}
          />
        )}
      </View>
    );
  }

  function ownerSection() {
    return (
      <View style={styles.section}>
        {sectionTitle(t("financial.export.owner.title"))}
        <ChipGroup
          layout={"wrap"}
          mode={"single"}
          onChange={vm.onOwnerChange}
          options={translateChoices(vm.ownerChoices, t).map((choice) => ({
            label: choice.label,
            value: choice.value,
          }))}
          testID={ids.exportOwner}
          value={vm.ownerSelection}
        />
      </View>
    );
  }

  function sourceRow(source: SourceOption) {
    const chosen =
      source.kind === "ACCOUNT"
        ? vm.accountIds.includes(source.id)
        : vm.cardIds.includes(source.id);

    return (
      <Checkbox
        checked={chosen}
        key={`${source.kind}-${source.id}`}
        label={source.name}
        onChange={() => vm.onSourceToggle(source)}
        testID={`${ids.exportSource}-${source.id}`}
      />
    );
  }

  function sourceGroup(title: string, items: SourceOption[]) {
    return items.length > 0 ? (
      <>
        <Text.Overline tone={"secondary"} value={title} />
        {items.map(sourceRow)}
      </>
    ) : null;
  }

  function sourcesSection() {
    const { accounts, archived, cards } = vm.sourceGroups;
    const summary =
      vm.selectedSourceCount === 0
        ? t("financial.export.sources.all")
        : t(
            pluralKey(
              "financial.export.sources.selected",
              vm.selectedSourceCount,
            ),
            { count: vm.selectedSourceCount },
          );

    return (
      <View style={styles.section}>
        {sectionTitle(t("financial.export.sources.title"))}
        <ListItem
          accessibilityLabel={`${t("financial.export.sources.title")}: ${summary}`}
          divider
          onPress={vm.onSourcesToggle}
          testID={ids.exportSources}
          title={summary}
          trailing={
            <Icon
              name={vm.sourcesOpen ? "chevron-up" : "chevron-down"}
              size={20}
            />
          }
        />
        {vm.sourcesOpen ? (
          <View style={styles.sourcesList}>
            {sourceGroup(t("financial.export.sources.accounts"), accounts)}
            {sourceGroup(t("financial.export.sources.cards"), cards)}
            {sourceGroup(t("financial.export.sources.archived"), archived)}
          </View>
        ) : null}
      </View>
    );
  }

  function formatSection() {
    return (
      <View style={styles.section}>
        {sectionTitle(t("financial.export.format.title"))}
        <ChipGroup
          layout={"wrap"}
          mode={"single"}
          onChange={(value) => vm.onFormatChange(value as "BR" | "INTL")}
          options={[
            { label: t("financial.export.format.br"), value: "BR" },
            { label: t("financial.export.format.intl"), value: "INTL" },
          ]}
          testID={ids.exportFormat}
          value={vm.format}
        />
        <Text.Caption
          tone={"secondary"}
          value={t("financial.export.format.help")}
        />
      </View>
    );
  }

  // The count texts carry the id themselves (Maestro web matches the text of the element that has the id).
  function countContent() {
    if (vm.periodError || vm.count === undefined) {
      return (
        <Text.Body
          testID={ids.exportCount}
          tone={"secondary"}
          value={
            vm.periodError
              ? t("financial.export.countInvalid")
              : t("financial.export.counting")
          }
        />
      );
    }

    if (vm.count === 0) {
      return (
        <Text.Body
          testID={ids.exportCount}
          value={t("financial.export.countNone")}
        />
      );
    }

    return (
      <View style={styles.count}>
        <Text.Heading
          tabular
          testID={ids.exportCount}
          value={String(vm.count)}
        />
        <Text.Body
          testID={`${ids.exportCount}-label`}
          value={t(pluralKey("financial.export.count", vm.count), {
            count: vm.count,
          })}
        />
      </View>
    );
  }

  function countBox() {
    return <Card padding={"md"}>{countContent()}</Card>;
  }

  return (
    <BottomSheet
      closeLabel={t("financial.export.close")}
      footer={
        <Button.Primary
          disabled={!vm.canExport}
          fullWidth
          label={t(
            isWeb() ? "financial.export.download" : "financial.export.share",
          )}
          loading={vm.isExporting}
          onPress={vm.onExport}
          size={"lg"}
          testID={ids.exportSubmit}
        />
      }
      footerSecondary={
        vm.wide ? (
          <Button.Secondary
            fullWidth
            label={t("financial.export.cancel")}
            onPress={vm.onClose}
            size={"lg"}
            testID={ids.exportCancel}
          />
        ) : undefined
      }
      onClose={vm.onClose}
      presentation={"inline"}
      size={"form"}
      testID={ids.exportSheet}
      title={t("financial.export.title")}
      visible
    >
      <FormColumns
        left={
          <>
            {periodSection()}
            {ownerSection()}
          </>
        }
        right={
          <>
            {sourcesSection()}
            {formatSection()}
            {countBox()}
          </>
        }
        testID={ids.exportSheet}
      />
      {vm.hasError ? (
        <View accessibilityRole={"alert"}>
          <Text.Caption tone={"expense"} value={t("financial.export.error")} />
        </View>
      ) : null}
    </BottomSheet>
  );
}

export default ExportModal;
