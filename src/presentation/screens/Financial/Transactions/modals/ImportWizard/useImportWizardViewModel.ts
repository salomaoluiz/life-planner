import { useEffect, useMemo, useState } from "react";

import { buildRows } from "@application/csvImport/buildRows";
import { canContinue, fieldStatuses } from "@application/csvImport/mapping";
import { suggestMapping } from "@application/csvImport/suggestColumns";
import {
  ColumnMapping,
  FixedValues,
  ImportRowPayload,
} from "@application/csvImport/types";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { ImportRowsInvalid } from "@domain/entities/errors";
import { ImportValidationEntity } from "@domain/entities/financial/TransactionCsv";
import { invalidateFetcherData, useMutation } from "@infrastructure/fetcher";
import { useBreakpoint } from "@presentation/theme";
import useImportRecords from "@screens/Financial/Transactions/hooks/useImportRecords";
import {
  headerKey,
  ParsedCsv,
} from "@screens/Financial/Transactions/models/importFile";
import {
  canImport,
  reviewRows,
  summarize,
} from "@screens/Financial/Transactions/models/importReview";
import {
  tabsOf,
  toValueMaps,
  unmatchedCount,
  ValueChoices,
  valueEntries,
  ValueTab,
} from "@screens/Financial/Transactions/models/importValues";
import {
  defaultImportOwner,
  ImportStep,
  nextStep,
  previousStep,
} from "@screens/Financial/Transactions/models/importWizard";

export interface ImportWizardParams {
  onClose: () => void;
  // Called with how many transactions were written, before the wizard closes.
  onImported: (count: number) => void;
  owners: OwnerDTO[];
  // The scope chip selected on the Transactions screen (FR 12).
  screenOwner: string;
}

interface CreatedCounts {
  accounts: number;
  cards: number;
  categories: number;
}

type ImportDialog = "discard" | "owner";

const NO_CREATED: CreatedCounts = { accounts: 0, cards: 0, categories: 0 };

// The import wizard (spec 047 FR 8-33): the state of the four steps and what the footer needs. Each step reads what it
// shows from here through its own view model.
function useImportWizardViewModel(params: ImportWizardParams) {
  const wide = useBreakpoint() !== "compact";
  const [step, setStep] = useState<ImportStep>("file");
  const [reached, setReached] = useState<ImportStep>("file");
  const [parsed, setParsed] = useState<ParsedCsv>();
  const [ownerId, setOwnerId] = useState(() =>
    defaultImportOwner(params.owners, params.screenOwner),
  );
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [fixed, setFixed] = useState<FixedValues>({});
  const [choices, setChoices] = useState<ValueChoices>({});
  const [selection, setSelection] = useState<Record<number, boolean>>({});
  const [created, setCreated] = useState<CreatedCounts>(NO_CREATED);
  const [dialog, setDialog] = useState<ImportDialog>();
  const [pendingOwner, setPendingOwner] = useState<string>();
  const records = useImportRecords(ownerId, params.owners);

  const table = parsed?.table ?? [];
  const headers = table[0] ?? [];
  const rows = useMemo(() => table.slice(1), [table]);
  const statuses = useMemo(
    () => fieldStatuses(mapping, fixed, rows),
    [mapping, fixed, rows],
  );
  const tabs = useMemo(() => tabsOf(mapping), [mapping]);
  const entries = useMemo(
    () =>
      Object.fromEntries(
        tabs.map((tab) => [
          tab,
          valueEntries(tab, rows, mapping, records, choices),
        ]),
      ) as Partial<Record<ValueTab, ReturnType<typeof valueEntries>>>,
    [tabs, rows, mapping, records, choices],
  );
  const unmatched = tabs.reduce(
    (total, tab) => total + unmatchedCount(entries[tab] ?? []),
    0,
  );
  const built = useMemo(
    () =>
      parsed && step === "review"
        ? buildRows({
            dateFormat: parsed.dateFormat,
            decimal: parsed.decimal,
            fixed,
            mapping,
            rows,
            valueMaps: toValueMaps(entries),
          })
        : { ignoredSystemRows: 0, rows: [] },
    [parsed, step, fixed, mapping, rows, entries],
  );

  // The dry run (FR 27) and the real run (FR 32).
  const ownerType = params.owners.find((owner) => owner.id === ownerId)?.type;
  const validateMutation = useMutation<
    ImportRowPayload[],
    ImportValidationEntity
  >({
    cacheKey: [useCases.validateFinancialImportUseCase.uniqueName],
    fetch: async (payloads) =>
      useCases.validateFinancialImportUseCase.execute({
        owner: ownerType ?? "USER",
        ownerId,
        rows: payloads,
      }),
  });
  const importMutation = useMutation<ImportRowPayload[], number>({
    cacheKey: [useCases.importFinancialTransactionsUseCase.uniqueName],
    fetch: async (payloads) =>
      useCases.importFinancialTransactionsUseCase.execute({
        owner: ownerType ?? "USER",
        ownerId,
        rows: payloads,
      }),
  });
  const refused =
    importMutation.error instanceof ImportRowsInvalid
      ? importMutation.error.errors
      : undefined;
  const validation: ImportValidationEntity | undefined = validateMutation.data
    ? {
        duplicates: validateMutation.data.duplicates,
        errors: refused ?? validateMutation.data.errors,
      }
    : undefined;
  const review = reviewRows(built.rows, validation, selection);
  const summary = summarize(review);
  const importDone = importMutation.status === "success";

  useEffect(() => {
    if (!importDone || importMutation.data === undefined) {
      return;
    }

    invalidateFetcherData();
    params.onImported(importMutation.data);
    params.onClose();
  }, [importDone]);

  // FR 31: with the same headers the mappings are kept (a new file of the same bank).
  function onFileRead(next: ParsedCsv) {
    const sameHeaders =
      !!parsed && headerKey(parsed.table) === headerKey(next.table);

    setParsed(next);
    if (!sameHeaders) {
      setMapping(suggestMapping(next.table[0] ?? [], next.table.slice(1)));
      setFixed({});
      setChoices({});
      setSelection({});
    }
  }

  function goTo(target: ImportStep) {
    setStep(target);
    setReached((current) => furthest(current, target));
  }

  function onContinue() {
    if (step === "review") {
      importMutation.mutate(
        review.flatMap((row) =>
          row.checked && !row.errorCode && row.payload ? [row.payload] : [],
        ),
      );

      return;
    }

    const target = nextStep(step);

    if (target === "review") {
      validateMutation.mutate(
        buildRows({
          dateFormat: parsed?.dateFormat ?? "dd/mm/yyyy",
          decimal: parsed?.decimal ?? ",",
          fixed,
          mapping,
          rows,
          valueMaps: toValueMaps(entries),
        }).rows.flatMap((row) => (row.payload ? [row.payload] : [])),
      );
      setSelection({});
    }
    goTo(target);
  }

  // FR 12: changing the owner after the values were matched clears them, after a confirmation.
  function onOwnerChange(value: string) {
    if (value === ownerId) {
      return;
    }

    if (reached === "values" || reached === "review") {
      setPendingOwner(value);
      setDialog("owner");

      return;
    }

    setOwnerId(value);
  }

  function onOwnerConfirm() {
    if (pendingOwner) {
      setOwnerId(pendingOwner);
      setChoices({});
      setSelection({});
      setCreated(NO_CREATED);
      setFixed(withoutRecords(fixed));
      setReached("columns");
    }
    setPendingOwner(undefined);
    setDialog(undefined);
  }

  // FR 33: closing asks to discard when something was loaded.
  function onRequestClose() {
    if (parsed) {
      setDialog("discard");

      return;
    }

    params.onClose();
  }

  const stepReady = {
    columns: canContinue(statuses),
    file: !!parsed && !parsed.problem && !!ownerId,
    review: canImport(summary) && !importMutation.isFetching,
    values: unmatched === 0,
  }[step];

  return {
    built,
    choices,
    created,
    dialog,
    entries,
    fixed,
    headers,
    importError:
      importMutation.error && !refused ? importMutation.error : undefined,
    isImporting: importMutation.isFetching,
    isValidating: validateMutation.isFetching,
    mapping,
    onBack: () => goTo(previousStep(step)),
    onContinue,
    onCreated: (kind: keyof CreatedCounts) =>
      setCreated((current) => ({ ...current, [kind]: current[kind] + 1 })),
    onDialogClose: () => {
      setDialog(undefined);
      setPendingOwner(undefined);
    },
    onDiscardConfirm: params.onClose,
    onFileRead,
    onFixedChange: setFixed,
    onMappingChange: setMapping,
    onOwnerChange,
    onOwnerConfirm,
    onRequestClose,
    onSelectionChange: (line: number, checked: boolean) =>
      setSelection((current) => ({ ...current, [line]: checked })),
    onValueChoice: (tab: ValueTab, value: string, selected: string) =>
      setChoices((current) => ({
        ...current,
        [tab]: { ...current[tab], [value]: selected },
      })),
    ownerId,
    owners: params.owners,
    parsed,
    records,
    review,
    rows,
    selection,
    statuses,
    step,
    stepReady,
    summary,
    tabs,
    unmatched,
    validated: !!validateMutation.data,
    wide,
  };
}

const ORDER: ImportStep[] = ["file", "columns", "values", "review"];

export type ImportWizardState = ReturnType<typeof useImportWizardViewModel>;

function furthest(a: ImportStep, b: ImportStep): ImportStep {
  return ORDER.indexOf(a) >= ORDER.indexOf(b) ? a : b;
}

// Fixed accounts, cards and categories belong to the previous owner.
function withoutRecords(values: FixedValues): FixedValues {
  return { type: values.type };
}
export default useImportWizardViewModel;
