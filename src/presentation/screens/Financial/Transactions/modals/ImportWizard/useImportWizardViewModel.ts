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
import { OwnerType } from "@domain/entities/user/OwnerEntity";
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
          defaultOwnerId: ownerId,
          fixed,
          mapping,
          ownerTypes: ownerTypesOf(params.owners),
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
    // The rows are checked again every time the review opens: no import on the answer of an earlier check.
    review:
      canImport(summary) &&
      !importMutation.isFetching &&
      !validateMutation.isFetching,
    values: unmatched === 0,
  }[step];

  return {
    built,
    catalog,
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
