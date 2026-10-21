import { useEffect, useMemo, useState } from "react";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { ExportFormat } from "@domain/entities/financial/TransactionCsv";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import { saveCsvFile } from "@infrastructure/fileSave";
import { useLocaleTag } from "@presentation/i18n";
import { useBreakpoint } from "@presentation/theme";
import {
  ALL_OWNERS,
  buildOwnerFilterChoices,
} from "@screens/Financial/models/ownerOptions";
import useFilterOptions, {
  SourceOption,
} from "@screens/Financial/Transactions/hooks/useFilterOptions";
import {
  defaultExportFormat,
  EXPORT_PRESETS,
  exportPreset,
  ExportPreset,
  presetOf,
  toExportQuery,
  validateExportPeriod,
} from "@screens/Financial/Transactions/models/exportCsv";
import { toDateKey } from "@screens/Financial/Transactions/models/transactionFilters";

export interface ExportModalParams {
  onClose: () => void;
  owners: OwnerDTO[];
}

const COUNT_DEBOUNCE_MS = 300;

function fromDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);

  return new Date(year, month - 1, day);
}

// The Export modal (spec 047 FR 2-4): its own period, owner, accounts and cards, format and live count. It never
// follows the filters of the Transactions screen.
function useExportModalViewModel(params: ExportModalParams) {
  const localeTag = useLocaleTag();
  const wide = useBreakpoint() !== "compact";
  const [period, setPeriod] = useState(() =>
    exportPreset("THIS_YEAR", new Date()),
  );
  const [ownerSelection, setOwnerSelection] = useState(ALL_OWNERS);
  const [accountIds, setAccountIds] = useState<string[]>([]);
  const [cardIds, setCardIds] = useState<string[]>([]);
  const [format, setFormat] = useState<ExportFormat>(
    defaultExportFormat(localeTag),
  );
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const allOwnerIds = useMemo(
    () => params.owners.map((owner) => owner.id),
    [params.owners],
  );
  const options = useFilterOptions(allOwnerIds, true);

  const validation = validateExportPeriod(period.from, period.to);
  const query = useMemo(
    () =>
      toExportQuery(
        { accountIds, cardIds, ownerSelection, period },
        params.owners,
      ),
    [accountIds, cardIds, ownerSelection, period, params.owners],
  );
  const queryKey = JSON.stringify(query);
  const [debouncedKey, setDebouncedKey] = useState(queryKey);

  // The count follows the choices 300 ms after the last change.
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedKey(queryKey),
      COUNT_DEBOUNCE_MS,
    );

    return () => clearTimeout(timer);
  }, [queryKey]);

  const count = useQuery<number>({
    cacheKey: [
      useCases.getFinancialExportCountUseCase.uniqueName,
      debouncedKey,
    ],
    enabled: validation.ok,
    fetch: async () =>
      useCases.getFinancialExportCountUseCase.execute(JSON.parse(debouncedKey)),
    retry: false,
  });
  const exportMutation = useMutation<void, void>({
    cacheKey: [useCases.exportFinancialTransactionsUseCase.uniqueName],
    fetch: async () => {
      const file = await useCases.exportFinancialTransactionsUseCase.execute({
        ...query,
        format,
        lang: localeTag,
      });

      await saveCsvFile({ csv: file.csv, name: file.filename });
    },
  });

  // Accounts and cards of the chosen owner(s), archived ones apart (same picker as the filters).
  const sourceGroups = useMemo(() => {
    // Personal and a family are both owner ids.
    const visible = options.sources.filter(
      (source: SourceOption) =>
        ownerSelection === ALL_OWNERS || source.ownerId === ownerSelection,
    );

    return {
      accounts: visible.filter(
        (source) => source.kind === "ACCOUNT" && !source.archived,
      ),
      archived: visible.filter((source) => source.archived),
      cards: visible.filter(
        (source) => source.kind === "CARD" && !source.archived,
      ),
    };
  }, [options.sources, ownerSelection]);

  const today = new Date();
  const countReady = validation.ok && count.data !== undefined;

  function onOwnerChange(value: string) {
    setOwnerSelection(value);
    // The chosen accounts and cards belong to the previous owner.
    setAccountIds([]);
    setCardIds([]);
  }

  function onSourceToggle(source: SourceOption) {
    function toggle(ids: string[]) {
      return ids.includes(source.id)
        ? ids.filter((id) => id !== source.id)
        : [...ids, source.id];
    }

    if (source.kind === "ACCOUNT") {
      setAccountIds(toggle(accountIds));
    } else {
      setCardIds(toggle(cardIds));
    }
  }

  return {
    accountIds,
    canExport:
      validation.ok && !exportMutation.isFetching && (count.data ?? 0) > 0,
    cardIds,
    count: countReady ? count.data : undefined,
    customFrom: fromDateKey(period.from),
    customTo: fromDateKey(period.to),
    format,
    hasError: !!exportMutation.error,
    isCounting: validation.ok && count.data === undefined,
    isExporting: exportMutation.isFetching,
    onClose: params.onClose,
    onExport: () => exportMutation.mutate(),
    onFormatChange: setFormat,
    onFromChange: (date?: Date) =>
      date && setPeriod({ ...period, from: toDateKey(date) }),
    onOwnerChange,
    onPresetChange: (preset: ExportPreset) =>
      setPeriod(exportPreset(preset, new Date())),
    onSourcesToggle: () => setSourcesOpen((open) => !open),
    onSourceToggle,
    onToChange: (date?: Date) =>
      date && setPeriod({ ...period, to: toDateKey(date) }),
    ownerChoices: buildOwnerFilterChoices(params.owners),
    ownerSelection,
    periodError: validation.ok
      ? undefined
      : {
          date: new Intl.DateTimeFormat(localeTag).format(
            fromDateKey(validation.maxTo),
          ),
        },
    preset: presetOf(period, today),
    presets: EXPORT_PRESETS,
    selectedSourceCount: accountIds.length + cardIds.length,
    sourceGroups,
    sourcesOpen,
    wide,
  };
}

export default useExportModalViewModel;
