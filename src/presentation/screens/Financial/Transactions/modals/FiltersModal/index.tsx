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
  SearchField,
  Text,
  Touchable,
} from "@components";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { SourceOption } from "@screens/Financial/Transactions/hooks/useFilterOptions";
import {
  CategoryNode,
  checkState,
} from "@screens/Financial/Transactions/models/categoryPicker";
import {
  formatPeriod,
  namesLabel,
} from "@screens/Financial/Transactions/models/filterLabels";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

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
  categories: "financial.transactions.filters.categories.title",
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
    const { accounts, archived, cards } = vm.sourceGroups;

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
        {archived.length > 0 ? (
          <>
            <Text.Overline
              tone={"secondary"}
              value={t("financial.transactions.filters.archived")}
            />
            {archived.map(sourceRow)}
          </>
        ) : null}
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

  function categoryRows(node: CategoryNode, ancestorChosen = false) {
    const state = checkState(node, new Set(draft.categoryIds), ancestorChosen);

    return (
      <View key={node.category.id}>
        <Checkbox
          checked={state}
          indent={node.depth * 24}
          label={node.category.name}
          onChange={() => vm.onCategoryToggle(node.category.id)}
          testID={`${ids.filtersCategory}-${node.category.id}`}
        />
        {node.children.map((child) => categoryRows(child, state === true))}
      </View>
    );
  }

  function categoryList() {
    return (
      <View>
        <SearchField
          clearLabel={t("common.actions.clear")}
          onChangeText={vm.onCategoryQueryChange}
          placeholder={t("financial.transactions.filters.categories.search")}
          testID={`${ids.filtersSection}.categories-search`}
          value={vm.categoryQuery}
        />
        {vm.categoryGroups.map((group) => (
          <View key={group.kind}>
            <Text.Overline
              tone={"secondary"}
              value={
                group.kind === "ARCHIVED"
                  ? t("financial.transactions.filters.archived")
                  : t(
                      group.kind === "EXPENSE"
                        ? "financial.transactions.filters.categories.expenses"
                        : "financial.transactions.filters.categories.income",
                    )
              }
            />
            {group.nodes.map((node) => categoryRows(node))}
          </View>
        ))}
        <Text.Caption
          tone={"secondary"}
          value={t("financial.transactions.filters.categories.help")}
        />
      </View>
    );
  }

  function categoriesSection() {
    return (
      <View style={styles.section} testID={`${ids.filtersSection}.categories`}>
        {sectionTitle(t("financial.transactions.filters.categories.title"))}
        {categoryList()}
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

  const sourceNames = [
    ...vm.sourceGroups.accounts,
    ...vm.sourceGroups.cards,
    ...vm.sourceGroups.archived,
  ]
    .filter((source) =>
      source.kind === "ACCOUNT"
        ? draft.accountIds.includes(source.id)
        : draft.cardIds.includes(source.id),
    )
    .map((source) => source.name);
  const categoryNames = namesLabel(
    vm.categoryGroups
      .flatMap((group) => flatten(group.nodes))
      .filter((node) => draft.categoryIds.includes(node.category.id))
      .map((node) => node.category.name),
  );

  function compactRoot() {
    return (
      <View style={styles.stack}>
        {pickerRow(
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
        {pickerRow(
          t("financial.transactions.filters.categories.title"),
          categoryNames || t("financial.transactions.filters.sources.all"),
          "categories",
          `${ids.filtersSection}.categories`,
        )}
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
        {vm.step === "categories" ? (
          <>
            <Text.Caption
              tone={"secondary"}
              value={t("financial.transactions.filters.categories.selected", {
                count: vm.selectedCategoryCount,
              })}
            />
            {categoryList()}
          </>
        ) : null}
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
            {periodSection()}
            {originSection()}
            {sourcesSection()}
            {situationSection()}
          </>
        }
        right={
          <>
            {categoriesSection()}
            {tagsSection()}
          </>
        }
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
  const stepDone = inStep && vm.step === "categories";

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
            stepDone || (inStep && vm.step !== "root")
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
      presentation={"inline"}
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

function flatten(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.flatMap((node) => [node, ...flatten(node.children)]);
}

export default FiltersModal;
