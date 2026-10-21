import { useMemo, useState } from "react";

import { useLocaleTag } from "@presentation/i18n";
import { useBreakpoint } from "@presentation/theme";
import useFilterOptions, {
  SourceOption,
} from "@screens/Financial/Transactions/hooks/useFilterOptions";
import {
  buildCategoryGroups,
  CategoryGroup,
  PickerCategory,
  toggleCategory,
} from "@screens/Financial/Transactions/models/categoryPicker";
import {
  FilterOrigin,
  FilterPeriod,
  FilterSituation,
  periodPreset,
  PeriodPreset,
  toDateKey,
  TransactionFilters,
  validatePeriod,
} from "@screens/Financial/Transactions/models/transactionFilters";

export interface FiltersModalParams {
  archivedOwnerIds: ReadonlySet<string>;
  filters: TransactionFilters;
  // The overview (spec 046) has its own period: the Period section is left out.
  hidePeriod?: boolean;
  // Compact only: the step the sheet opens on (the period chip opens it on "period").
  initialStep?: FiltersStep;
  onApply: (filters: TransactionFilters) => void;
  onClose: () => void;
  ownerIds: string[];
  // The ids of the scope chip on screen: pickers list what belongs to it.
  scopeOwnerIds: string[];
}
export type FiltersStep = "categories" | "period" | "root" | "sources";

export type PeriodMode = "CUSTOM" | "NONE" | PeriodPreset;

const PRESETS: PeriodPreset[] = ["THIS_MONTH", "LAST_3_MONTHS", "THIS_YEAR"];

function clearedDraft() {
  return {
    accountIds: [],
    cardIds: [],
    categoryIds: [],
    origin: undefined,
    period: undefined,
    situation: undefined,
    tagIds: [],
  };
}

function fromDateKey(key?: string) {
  if (!key) {
    return undefined;
  }

  const [year, month, day] = key.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function modeOf(period?: FilterPeriod): PeriodMode {
  if (!period) {
    return "NONE";
  }

  const today = new Date();

  return (
    PRESETS.find((preset) => {
      const range = periodPreset(preset, today);

      return range.from === period.from && range.to === period.to;
    }) ?? "CUSTOM"
  );
}

function sameScope(ids: string[], scope: string[]) {
  return ids.some((id) => scope.includes(id));
}

// The draft of the Filters modal (mounted only while open, so it starts from the applied filters) (spec 045 FR 18-21): nothing reaches the list until "Apply filters".
function useFiltersModalViewModel(params: FiltersModalParams) {
  const localeTag = useLocaleTag();
  const wide = useBreakpoint() !== "compact";
  const [draft, setDraft] = useState(params.filters);
  const [step, setStep] = useState<FiltersStep>(params.initialStep ?? "root");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [periodMode, setPeriodMode] = useState<PeriodMode>(
    modeOf(params.filters.period),
  );
  const [customFrom, setCustomFrom] = useState<Date | undefined>(
    fromDateKey(params.filters.period?.from),
  );
  const [customTo, setCustomTo] = useState<Date | undefined>(
    fromDateKey(params.filters.period?.to),
  );
  const options = useFilterOptions(params.ownerIds, true);

  const pickerCategories = useMemo<PickerCategory[]>(
    () =>
      options.categoryDtos
        .filter(
          (category) =>
            sameScope(category.scopeOwnerIds, params.scopeOwnerIds) &&
            category.scopeOwnerIds.some(
              (id) => !params.archivedOwnerIds.has(id),
            ),
        )
        .map((category) => ({
          archived: category.status === "ARCHIVED",
          id: category.id,
          name: category.name,
          parentId: category.parentId,
          type: category.type,
        })),
    [options.categoryDtos, params.scopeOwnerIds, params.archivedOwnerIds],
  );
  const categoryGroups = useMemo<CategoryGroup[]>(
    () => buildCategoryGroups(pickerCategories, categoryQuery),
    [pickerCategories, categoryQuery],
  );
  // Toggling works over the whole tree, not over the rows the search left on screen.
  const fullGroups = useMemo(
    () => buildCategoryGroups(pickerCategories),
    [pickerCategories],
  );

  const sourceGroups = useMemo(() => {
    const visible = options.sources.filter((source) => {
      if (draft.origin === "ACCOUNT") {
        return source.kind === "ACCOUNT";
      }

      return draft.origin === "CARD" ? source.kind === "CARD" : true;
    });

    return {
      accounts: visible.filter(
        (source) => source.kind === "ACCOUNT" && !source.archived,
      ),
      archived: visible.filter((source) => source.archived),
      cards: visible.filter(
        (source) => source.kind === "CARD" && !source.archived,
      ),
    };
  }, [options.sources, draft.origin]);

  const tagsInScope = useMemo(
    () =>
      options.tags.filter((tag) =>
        sameScope(tag.scopeOwnerIds, params.scopeOwnerIds),
      ),
    [options.tags, params.scopeOwnerIds],
  );
  const tagNames = useMemo(() => {
    const names: string[] = [];

    draft.tagIds.forEach((id) => {
      const name = options.tags.find((tag) => tag.id === id)?.name;

      if (
        name &&
        !names.some((item) => item.toLowerCase() === name.toLowerCase())
      ) {
        names.push(name);
      }
    });

    return names;
  }, [draft.tagIds, options.tags]);
  const tagSuggestions = useMemo(() => {
    const seen = new Set<string>();

    return tagsInScope
      .filter((tag) => {
        const key = tag.name.toLowerCase();

        if (seen.has(key)) {
          return false;
        }
        seen.add(key);

        return true;
      })
      .map((tag) => ({ id: tag.id, label: tag.name }));
  }, [tagsInScope]);

  const period = periodMode === "CUSTOM" ? customPeriod() : draft.period;
  const periodValidation =
    periodMode === "CUSTOM" && period
      ? validatePeriod(period.from, period.to)
      : ({ ok: true } as const);
  const periodIncomplete = periodMode === "CUSTOM" && !period;
  const periodError = periodValidation.ok
    ? undefined
    : {
        date: new Intl.DateTimeFormat(localeTag).format(
          fromDateKey(periodValidation.maxTo),
        ),
      };
  const canApply = periodValidation.ok && !periodIncomplete;

  function customPeriod(): FilterPeriod | undefined {
    return customFrom && customTo
      ? { from: toDateKey(customFrom), to: toDateKey(customTo) }
      : undefined;
  }

  function applied(): TransactionFilters {
    return { ...draft, period: periodMode === "NONE" ? undefined : period };
  }

  function chooseMode(mode: PeriodMode) {
    // Pressing the chosen preset again goes back to "no period".
    const next = mode === periodMode ? "NONE" : mode;

    setPeriodMode(next);
    if (next === "NONE") {
      setDraft({ ...draft, period: undefined });
    } else if (next !== "CUSTOM") {
      setDraft({ ...draft, period: periodPreset(next, new Date()) });
    } else if (draft.period) {
      setCustomFrom(fromDateKey(draft.period.from));
      setCustomTo(fromDateKey(draft.period.to));
    }
  }

  function setOrigin(origin?: FilterOrigin) {
    // The picker follows the origin: the kind that is no longer listed is cleared.
    setDraft({
      ...draft,
      accountIds: origin === "CARD" ? [] : draft.accountIds,
      cardIds: origin === "ACCOUNT" ? [] : draft.cardIds,
      origin: origin === draft.origin ? undefined : origin,
    });
  }

  function toggleSource(source: SourceOption) {
    const key = source.kind === "ACCOUNT" ? "accountIds" : "cardIds";
    const current = draft[key];

    setDraft({
      ...draft,
      [key]: current.includes(source.id)
        ? current.filter((id) => id !== source.id)
        : [...current, source.id],
    });
  }

  function setTagNames(names: string[]) {
    const wanted = new Set(names.map((name) => name.toLowerCase()));

    setDraft({
      ...draft,
      tagIds: options.tags
        .filter((tag) => wanted.has(tag.name.toLowerCase()))
        .map((tag) => tag.id),
    });
  }

  return {
    canApply,
    categoryGroups,
    categoryQuery,
    customFrom,
    customTo,
    draft,
    onApply: () => {
      params.onApply(applied());
      params.onClose();
    },
    onCategoryQueryChange: setCategoryQuery,
    onCategoryToggle: (id: string) =>
      setDraft({
        ...draft,
        categoryIds: toggleCategory(fullGroups, new Set(draft.categoryIds), id),
      }),
    onClearAll: () => {
      setDraft({ ...draft, ...clearedDraft() });
      setPeriodMode("NONE");
      setCustomFrom(undefined);
      setCustomTo(undefined);
    },
    onCustomFromChange: setCustomFrom,
    onCustomToChange: setCustomTo,
    onModeChange: chooseMode,
    onOriginChange: setOrigin,
    onSituationChange: (situation: FilterSituation) =>
      setDraft({
        ...draft,
        situation: situation === draft.situation ? undefined : situation,
      }),
    onSourceToggle: toggleSource,
    onStepChange: setStep,
    onTagsChange: setTagNames,
    periodError,
    periodMode,
    selectedCategoryCount: draft.categoryIds.length,
    sourceGroups,
    step,
    tagNames,
    tagSuggestions,
    wide,
  };
}

export { PRESETS };
export default useFiltersModalViewModel;
