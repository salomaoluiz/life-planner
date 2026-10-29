import { View } from "react-native";

import {
  AutocompleteField,
  BottomSheet,
  Button,
  Checkbox,
  ChipGroup,
  DateField,
  FormColumns,
  Icon,
  ListItem,
  Text,
  Touchable,
} from "@components";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { SourceOption } from "@screens/Financial/Transactions/hooks/useFilterOptions";
import {
  formatPeriod,
  namesLabel,
} from "@screens/Financial/Transactions/models/filterLabels";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import CategorySearchField from "./components/CategorySearchField";
import useStyles from "./styles";
import useFiltersModalViewModel, {
  FiltersModalParams,
  FiltersStep,
  PeriodMode,
} from "./useFiltersModalViewModel";

const MODE_KEYS = {
  CUSTOM: "financial.transactions.filters.period.custom",
  LAST_3_MONTHS: "financial.transactions.filters.period.last3Months",
  NONE: "financial.transactions.filters.period.none",
  THIS_MONTH: "financial.transactions.filters.period.thisMonth",
  THIS_YEAR: "financial.transactions.filters.period.thisYear",
} as const;
const MODES: PeriodMode[] = [
  "THIS_MONTH",
  "LAST_3_MONTHS",
  "THIS_YEAR",
  "CUSTOM",
];
const STEP_TITLES = {
  period: "financial.transactions.filters.period.title",
  sources: "financial.transactions.filters.sources.title",
} as const;
const ids = transactionsTestIds;

// The Filters modal (spec 045 FR 18-21): two columns on web/tablet, a compact sheet with steps on mobile.
function FiltersModal(props: FiltersModalParams) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const vm = useFiltersModalViewModel(props);
  const { draft } = vm;
  const inStep = !vm.wide && vm.step !== "root";

  function sectionTitle(text: string) {
    return <Text.BodyStrong value={text} />;
  }

  function periodSection() {
    const custom = vm.periodMode === "CUSTOM";

    return (
      <View style={styles.section} testID={`${ids.filtersSection}.period`}>
        {sectionTitle(t("financial.transactions.filters.period.title"))}
        <ChipGroup
          mode={"single"}
          onChange={(value) => vm.onModeChange(value as PeriodMode)}
          options={MODES.map((mode) => ({
            label: t(MODE_KEYS[mode]),
            value: mode,
          }))}
          testID={`${ids.filtersSection}.period-mode`}
          value={vm.periodMode === "NONE" ? undefined : vm.periodMode}
        />
        {custom ? dateFields() : null}
        <Text.Caption
          tone={"secondary"}
          value={t("financial.transactions.filters.period.help")}
        />
      </View>
    );
  }

  function dateFields() {
    return (
      <View style={styles.dates}>
        <View style={styles.date}>
          <DateField
            label={t("financial.transactions.filters.period.from")}
            maxDate={vm.customTo}
            onChange={vm.onCustomFromChange}
            testID={`${ids.filtersSection}.period-from`}
            value={vm.customFrom}
          />
        </View>
        <View style={styles.date}>
          <DateField
            label={t("financial.transactions.filters.period.to")}
            minDate={vm.customFrom}
            onChange={vm.onCustomToChange}
            testID={`${ids.filtersSection}.period-to`}
            value={vm.customTo}
          />
        </View>
        {vm.periodError ? (
          <View accessibilityRole={"alert"}>
            <Text.Caption
              testID={ids.filtersPeriodError}
              tone={"expense"}
              value={t(
                "financial.transactions.filters.period.error",
                vm.periodError,
              )}
            />
          </View>
        ) : null}
      </View>
    );
  }

  function originSection() {
    return (
      <View style={styles.section} testID={`${ids.filtersSection}.origin`}>
        {sectionTitle(t("financial.transactions.filters.origin.title"))}
        <ChipGroup
          mode={"single"}
          onChange={(value) => vm.onOriginChange(value as "ACCOUNT" | "CARD")}
          options={[
            {
              label: t("financial.transactions.filters.origin.account"),
              value: "ACCOUNT",
            },
            {
              label: t("financial.transactions.filters.origin.card"),
              value: "CARD",
            },
          ]}
          testID={`${ids.filtersSection}.origin-option`}
          value={draft.origin}
        />
        <Text.Caption
          tone={"secondary"}
          value={t("financial.transactions.filters.origin.help")}
        />
      </View>
    );
  }

  function sourceRow(source: SourceOption) {
    const chosen =
      source.kind === "ACCOUNT"
        ? draft.accountIds.includes(source.id)
        : draft.cardIds.includes(source.id);

    return (
      <Checkbox
        checked={chosen}
        disabled={false}
        key={`${source.kind}-${source.id}`}
        label={source.name}
        onChange={() => vm.onSourceToggle(source)}
        testID={`${ids.filtersSource}-${source.id}`}
      />
    );
  }

  function sourceList() {
    const { accounts, cards } = vm.sourceGroups;

    return (
      <View>
        {accounts.length > 0 ? (
          <>
            <Text.Overline
              tone={"secondary"}
              value={t("financial.transactions.filters.sources.accounts")}
            />
            {accounts.map(sourceRow)}
          </>
        ) : null}
        {cards.length > 0 ? (
          <>
            <Text.Overline
              tone={"secondary"}
              value={t("financial.transactions.filters.sources.cards")}
            />
            {cards.map(sourceRow)}
          </>
        ) : null}
        <Text.Caption
          tone={"secondary"}
          value={t("financial.transactions.filters.sources.archivedHidden")}
        />
      </View>
    );
  }

  function sourcesSection() {
    return (
      <View style={styles.section} testID={`${ids.filtersSection}.sources`}>
        {sectionTitle(t("financial.transactions.filters.sources.title"))}
        {sourceList()}
      </View>
    );
  }

  function categoriesSection() {
    return (
      <View style={styles.section} testID={`${ids.filtersSection}.categories`}>
        {sectionTitle(t("financial.transactions.filters.categories.title"))}
        <CategorySearchField
          chips={vm.selectedCategoryChips}
          dropdown={vm.wide}
          onPick={vm.onCategoryPick}
          onQueryChange={vm.onCategoryQueryChange}
          onRemove={vm.onCategoryRemove}
          query={vm.categoryQuery}
          results={vm.categoryResults}
        />
      </View>
    );
  }

  function tagsSection() {
    return (
      <View style={styles.section} testID={`${ids.filtersSection}.tags`}>
        <AutocompleteField
          label={t("financial.transactions.filters.tags.title")}
          mode={"chips"}
          onChange={vm.onTagsChange}
          placeholder={t("financial.transactions.filters.tags.placeholder")}
          removeLabel={(label) =>
            t("common.autocompleteField.remove", { label })
          }
          resultsLabel={(count) =>
            t(pluralKey("common.autocompleteField.results", count), { count })
          }
          suggestions={vm.tagSuggestions}
          testID={`${ids.filtersSection}.tags-field`}
          values={vm.tagNames}
        />
        <Text.Caption
          tone={"secondary"}
          value={t("financial.transactions.filters.tags.help")}
        />
      </View>
    );
  }

  function situationSection() {
    return (
      <View style={styles.section} testID={`${ids.filtersSection}.situation`}>
        {sectionTitle(t("financial.transactions.filters.situation.title"))}
        <ChipGroup
          mode={"single"}
          onChange={(value) => vm.onSituationChange(value as "PAID" | "UNPAID")}
          options={[
            {
              label: t("financial.transactions.filters.situation.paid"),
              value: "PAID",
            },
            {
              label: t("financial.transactions.filters.situation.unpaid"),
              value: "UNPAID",
            },
          ]}
          testID={`${ids.filtersSection}.situation-option`}
          value={draft.situation}
        />
      </View>
    );
  }

  function pickerRow(
    title: string,
    value: string,
    step: Exclude<FiltersStep, "root">,
    testID: string,
  ) {
    return (
      <ListItem
        accessibilityLabel={`${title}: ${value}`}
        divider
        onPress={() => vm.onStepChange(step)}
        subtitle={value}
        testID={testID}
        title={title}
        trailing={<Icon name={"chevron-right"} size={20} />}
      />
    );
  }

  const sourceNames = [...vm.sourceGroups.accounts, ...vm.sourceGroups.cards]
    .filter((source) =>
      source.kind === "ACCOUNT"
        ? draft.accountIds.includes(source.id)
        : draft.cardIds.includes(source.id),
    )
    .map((source) => source.name);
  function compactRoot() {
    return (
      <View style={styles.stack}>
        {props.hidePeriod
          ? null
          : pickerRow(
              t("financial.transactions.filters.period.title"),
              draft.period
                ? formatPeriod(draft.period, localeTag)
                : t("financial.transactions.filters.period.none"),
              "period",
              `${ids.filtersSection}.period`,
            )}
        {originSection()}
        {pickerRow(
          t("financial.transactions.filters.sources.title"),
          sourceNames.length > 0
            ? namesLabel(sourceNames)
            : t("financial.transactions.filters.sources.all"),
          "sources",
          `${ids.filtersSection}.sources`,
        )}
        {categoriesSection()}
        {tagsSection()}
        {situationSection()}
      </View>
    );
  }

  function compactStep() {
    return (
      <View style={styles.stack}>
        <Touchable
          accessibilityLabel={t("financial.transactions.filters.back")}
          accessibilityRole={"button"}
          onPress={() => vm.onStepChange("root")}
          style={styles.back}
          testID={ids.filtersBack}
        >
          <Icon name={"chevron-left"} size={24} />
          <Text.Body value={t("financial.transactions.filters.back")} />
        </Touchable>
        {vm.step === "period" ? periodStep() : null}
        {vm.step === "sources" ? sourceList() : null}
      </View>
    );
  }

  function periodStep() {
    return (
      <View style={styles.stack}>
        <ChipGroup
          mode={"single"}
          onChange={(value) => vm.onModeChange(value as PeriodMode)}
          options={(["NONE", ...MODES] as PeriodMode[]).map((mode) => ({
            label: t(MODE_KEYS[mode]),
            value: mode,
          }))}
          testID={`${ids.filtersSection}.period-mode`}
          value={vm.periodMode}
        />
        {vm.periodMode === "CUSTOM" ? dateFields() : null}
      </View>
    );
  }

  function wideBody() {
    return (
      <FormColumns
        left={
          <>
            {props.hidePeriod ? null : periodSection()}
            {originSection()}
            {sourcesSection()}
            {situationSection()}
          </>
        }
        leftPaneTestID={`${ids.filtersSheet}-pane-left`}
        right={
          <>
            {categoriesSection()}
            {tagsSection()}
          </>
        }
        rightPaneTestID={`${ids.filtersSheet}-pane-right`}
        testID={ids.filtersSheet}
      />
    );
  }

  const clearButton = (
    <Button.Ghost
      label={t("financial.transactions.filters.clearAll")}
      onPress={vm.onClearAll}
      testID={ids.filtersClear}
    />
  );

  function renderBody() {
    if (vm.wide) {
      return wideBody();
    }

    return vm.step === "root" ? compactRoot() : compactStep();
  }

  return (
    <BottomSheet
      closeLabel={t("financial.transactions.filters.close")}
      footer={
        <Button.Primary
          disabled={!vm.canApply}
          fullWidth
          label={t(
            inStep
              ? "financial.transactions.filters.done"
              : "financial.transactions.filters.apply",
          )}
          onPress={inStep ? () => vm.onStepChange("root") : vm.onApply}
          size={"lg"}
          testID={inStep ? ids.filtersDone : ids.filtersApply}
        />
      }
      footerSecondary={
        vm.wide ? (
          <Button.Secondary
            fullWidth
            label={t("financial.transactions.filters.cancel")}
            onPress={props.onClose}
            size={"lg"}
            testID={ids.filtersCancel}
          />
        ) : (
          !inStep && clearButton
        )
      }
      footerStart={vm.wide ? clearButton : undefined}
      onClose={props.onClose}
      paneScroll
      size={"form"}
      testID={ids.filtersSheet}
      title={t(
        inStep && vm.step !== "root"
          ? STEP_TITLES[vm.step]
          : "financial.transactions.filters.title",
      )}
      visible
    >
      {renderBody()}
    </BottomSheet>
  );
}

export default FiltersModal;
