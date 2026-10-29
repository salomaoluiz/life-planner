import { useEffect, useMemo, useRef, useState } from "react";

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
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { invalidateFetcherData, useMutation } from "@infrastructure/fetcher";
import { useBreakpoint } from "@presentation/theme";
import useImportRecords from "@screens/Financial/Transactions/hooks/useImportRecords";
import {
  addCreated,
  CreatedCategory,
  removeCreated,
  unmatchCategories,
} from "@screens/Financial/Transactions/models/createdCategories";
import {
  headerKey,
  ParsedCsv,
} from "@screens/Financial/Transactions/models/importFile";
import {
  canImport,
  kindCounts,
  mergeValidation,
  revalidationRequest,
  reviewRows,
  selectionKey,
  summarize,
} from "@screens/Financial/Transactions/models/importReview";
import {
  EntryContext,
  NO_RECORDS,
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

interface PendingCheck {
  id: number;
  // The checked lines sent; absent on the first check, where they come from the answer.
  key?: string;
  selection: Record<number, boolean>;
}

interface ValidatedSnapshot {
  key: string;
  kinds: { credits: number; payments: number };
}

// Spec 049: every dry run carries an id so a late answer cannot clear a newer check.
interface ValidateRequest {
  includeDuplicates?: number[];
  requestId: number;
  rows: ImportRowPayload[];
}

type ValidateResult = ImportValidationEntity & { requestId?: number };

const EMPTY_CONTEXT: EntryContext = {
  catalog: {},
  decimal: ",",
  defaultOwnerId: "",
  fixed: {},
  ownerMap: {},
  owners: [],
  typeMap: {},
};

// The names a "Belongs to" value can match an owner by: Personal also answers to "Pessoal"/"Personal".
function ownerCandidates(owners: OwnerDTO[]) {
  return owners
    .filter((owner) => !owner.archived)
    .map((owner) => ({
      id: owner.id,
      names:
        owner.type === OwnerType.USER
          ? ["Pessoal", "Personal", owner.name]
          : [owner.name],
    }));
}

function ownerTypesOf(owners: OwnerDTO[]) {
  return Object.fromEntries(
    owners.map((owner) => [owner.id, owner.type]),
  ) as Record<string, "FAMILY" | "USER">;
}

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
  // Spec 054 FR 4: the categories created in this run (every level of a chain); lost when the wizard closes.
  const [createdCategories, setCreatedCategories] = useState<CreatedCategory[]>(
    [],
  );
  const [dialog, setDialog] = useState<ImportDialog>();
  const [pendingOwner, setPendingOwner] = useState<string>();
  const catalog = useImportRecords(params.owners);
  const records = catalog[ownerId] ?? NO_RECORDS;

  const table = parsed?.table ?? [];
  const headers = table[0] ?? [];
  const rows = useMemo(() => table.slice(1), [table]);
  const statuses = useMemo(
    () => fieldStatuses(mapping, fixed, rows),
    [mapping, fixed, rows],
  );
  const tabs = useMemo(() => tabsOf(mapping), [mapping]);
  const entries = useMemo(() => {
    // The matched answers of the Type and "Belongs to" columns tell the type and the owner of each row, which the
    // categories, accounts and cards are matched by.
    const base = {
      catalog,
      decimal: parsed?.decimal ?? ",",
      defaultOwnerId: ownerId,
      fixed,
      ownerMap: {},
      owners: ownerCandidates(params.owners),
      typeMap: toValueMaps({
        type: valueEntries("type", rows, mapping, choices, {
          ...EMPTY_CONTEXT,
          catalog,
        }),
      }).type,
    };
    const ownerEntries = valueEntries("owner", rows, mapping, choices, {
      ...EMPTY_CONTEXT,
      ...base,
    });
    const context = {
      ...base,
      ownerMap: toValueMaps({ owner: ownerEntries }).owner,
    };

    return Object.fromEntries(
      tabs.map((tab) => [
        tab,
        tab === "owner"
          ? ownerEntries
          : valueEntries(tab, rows, mapping, choices, context),
      ]),
    ) as Partial<Record<ValueTab, ReturnType<typeof valueEntries>>>;
  }, [
    tabs,
    rows,
    mapping,
    catalog,
    choices,
    parsed,
    fixed,
    ownerId,
    params.owners,
  ]);
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
            defaultOwnerId: ownerId,
            fixed,
            mapping,
            ownerTypes: ownerTypesOf(params.owners),
            rows,
            valueMaps: toValueMaps(entries),
          })
        : { ignoredSystemRows: 0, rows: [] },
    [parsed, step, fixed, mapping, rows, entries, ownerId, params.owners],
  );

  // The dry run (FR 27) and the real run (FR 32).
  const ownerType = params.owners.find((owner) => owner.id === ownerId)?.type;
  const validateMutation = useMutation<ValidateRequest, ValidateResult>({
    cacheKey: [useCases.validateFinancialImportUseCase.uniqueName],
    fetch: async (request) => ({
      ...(await useCases.validateFinancialImportUseCase.execute({
        includeDuplicates: request.includeDuplicates,
        owner: ownerType ?? "USER",
        ownerId,
        rows: request.rows,
      })),
      requestId: request.requestId,
    }),
  });
  // Spec 048: the duplicates are found on the full file (first check); a later check only sees the checked rows.
  const [knownDuplicates, setKnownDuplicates] = useState<number[]>([]);
  const firstCheck = useRef(false);
  // Spec 049: the last successful check (its answer and the selection it checked) gates the import.
  const [applied, setApplied] = useState<ValidateResult>();
  const [snapshot, setSnapshot] = useState<ValidatedSnapshot>();
  const appliedData = useRef<ValidateResult>();
  const pending = useRef<PendingCheck>();
  const requestSeq = useRef(0);
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
  const validation: ImportValidationEntity | undefined = applied
    ? mergeValidation(knownDuplicates, {
        duplicates: applied.duplicates,
        errors: refused ?? applied.errors,
        invoices: applied.invoices,
      })
    : undefined;
  const review = reviewRows(built.rows, validation, selection);
  const summary = summarize(review);
  const importDone = importMutation.status === "success";

  useEffect(() => {
    const result = validateMutation.data;
    const check = pending.current;

    if (
      !result ||
      !check ||
      step !== "review" ||
      appliedData.current === result
    ) {
      return;
    }

    if (result.requestId !== undefined && result.requestId !== check.id) {
      return;
    }

    appliedData.current = result;
    const merged = mergeValidation(knownDuplicates, result);
    const checked = reviewRows(built.rows, merged, check.selection);

    setApplied(result);
    setSnapshot({
      key: check.key ?? selectionKey(checked),
      kinds: kindCounts(checked),
    });

    if (firstCheck.current) {
      firstCheck.current = false;
      setKnownDuplicates(result.duplicates);
    }
  }, [validateMutation.data, step, built.rows]);

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
      // FR 16: the first check runs once, on the full file; a later check only sees the checked rows.
      requestSeq.current += 1;
      pending.current = { id: requestSeq.current, selection: {} };
      firstCheck.current = true;
      appliedData.current = undefined;
      setApplied(undefined);
      setSnapshot(undefined);
      setKnownDuplicates([]);
      validateMutation.mutate({
        requestId: requestSeq.current,
        rows: buildRows({
          dateFormat: parsed?.dateFormat ?? "dd/mm/yyyy",
          decimal: parsed?.decimal ?? ",",
          defaultOwnerId: ownerId,
          fixed,
          mapping,
          ownerTypes: ownerTypesOf(params.owners),
          rows,
          valueMaps: toValueMaps(entries),
        }).rows.flatMap((row) => (row.payload ? [row.payload] : [])),
      });
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

  const stale = !!snapshot && snapshot.key !== selectionKey(review);
  const refreshFailed = validateMutation.status === "error" && !!applied;
  const stepReady = {
    columns: canContinue(statuses),
    file: !!parsed && !parsed.problem && !!ownerId,
    // The rows are checked again every time the review opens, and the selection must have been checked since.
    review:
      canImport(summary) &&
      !!applied &&
      !stale &&
      !refreshFailed &&
      !importMutation.isFetching &&
      !validateMutation.isFetching,
    values: unmatched === 0,
  }[step];

  return {
    built,
    catalog,
    choices,
    created,
    createdCategories,
    dialog,
    entries,
    fixed,
    headers,
    importError:
      importMutation.error && !refused ? importMutation.error : undefined,
    invoices: applied?.invoices ?? [],
    isImporting: importMutation.isFetching,
    isRefreshing: validateMutation.isFetching && !!applied,
    isValidating: validateMutation.isFetching,
    kinds: snapshot?.kinds ?? { credits: 0, payments: 0 },
    mapping,
    onBack: () => goTo(previousStep(step)),
    // Spec 054 FR 4: a chain adds every level it created to the summary counter too.
    onCategoriesCreated: (ownerIdOfLevels: string, ids: string[]) => {
      setCreatedCategories((current) =>
        addCreated(current, ownerIdOfLevels, ids),
      );
      setCreated((current) => ({
        ...current,
        categories: current.categories + ids.length,
      }));
    },
    // Spec 054 FR 8: the values matched to a deleted category go back to no match and the counter goes down.
    onCategoriesDeleted: (ids: string[]) => {
      setCreatedCategories((current) => removeCreated(current, ids));
      setChoices((current) => unmatchCategories(current, ids));
      setCreated((current) => ({
        ...current,
        categories: Math.max(current.categories - ids.length, 0),
      }));
    },
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
    onRefresh: () => {
      // FR 18: only the checked rows; FR 19: their key is what the answer makes fresh.
      requestSeq.current += 1;
      const check: PendingCheck = {
        id: requestSeq.current,
        key: selectionKey(review),
        selection,
      };

      pending.current = check;
      validateMutation.mutate({
        ...revalidationRequest(review),
        requestId: check.id,
      });
    },
    onRequestClose,
    // Spec 054 FR 19: one change for many rows, so the review goes stale once and needs one Refresh.
    onSelectionBulkChange: (lines: number[], checked: boolean) =>
      setSelection((current) => ({
        ...current,
        ...Object.fromEntries(lines.map((line) => [line, checked])),
      })),
    // FR 15: checking or unchecking a row only changes local state — the dry run waits for Refresh.
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
    refreshFailed,
    review,
    rows,
    selection,
    stale,
    statuses,
    step,
    stepReady,
    summary,
    tabs,
    unmatched,
    validated: !!applied,
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
