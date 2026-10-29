import { useEffect, useRef, useState } from "react";
import { ScrollView } from "react-native";

import { matchCreditCategory } from "@application/csvImport/cardCredits";
import { autoMatch } from "@application/csvImport/distinctValues";
import { RowType } from "@application/csvImport/types";
import { useCases } from "@application/useCases";
import { invalidateFetcherData, useMutation } from "@infrastructure/fetcher";
import { IMPORTED_CARD_DEFAULTS } from "@presentation/constants/cardColors";
import { IMPORTED_CATEGORY_DEFAULTS } from "@presentation/constants/categoryColors";
import {
  createCategoryChain,
  splitCategoryPath,
} from "@screens/Financial/Transactions/models/categoryChain";
import {
  createdList,
  deletionPlan,
} from "@screens/Financial/Transactions/models/createdCategories";
import {
  nextUnmatchedKey,
  NO_RECORDS,
  unmatchedCount,
  ValueEntry,
  ValueTab,
} from "@screens/Financial/Transactions/models/importValues";
import { isWeb } from "@utils/platform";

import { ImportWizardState } from "../useImportWizardViewModel";

const CREATE = "__create__";
const HIGHLIGHT_MS = 2000;
const LIST_PADDING = 32;
const ROW_AIR = 8;

type CreatableTab = "account" | "card" | "category";

interface CreateForm {
  closingDay: string;
  dueDay: string;
  limitCents: number;
  name: string;
  parentId: string;
  // Spec 048 FR 29b: categories only; "ALL" is valid for Personal and every family.
  scope: "ALL" | "OWNER";
  type: RowType;
}

interface CreateRequest {
  form: CreateForm;
  ownerId: string;
  parentDepth: number;
  tab: CreatableTab;
}

// Which counter of the review summary a created record adds to.
const COUNTED = {
  account: "accounts",
  card: "cards",
  category: "categories",
} as const;

function emptyForm(name: string, type: RowType): CreateForm {
  return {
    closingDay: "1",
    dueDay: "10",
    limitCents: 0,
    name,
    parentId: "",
    scope: "OWNER",
    type,
  };
}

function isCreatable(tab: ValueTab): tab is CreatableTab {
  return tab === "account" || tab === "card" || tab === "category";
}

// Step 3 (spec 047 FR 22-26): each distinct value of the mapped columns matched to a record of the app, with the
// records created right here when they do not exist.
function useValuesStepViewModel(wizard: ImportWizardState) {
  const [tab, setTab] = useState<ValueTab>();
  const [creating, setCreating] = useState<{
    key: string;
    ownerId: string;
    tab: CreatableTab;
    type?: RowType;
    value: string;
  }>();
  const [form, setForm] = useState<CreateForm>(emptyForm("", "EXPENSE"));
  // The last Belongs to chosen stays for the next values ("Create and use" moves on to them, spec 048).
  const lastScope = useRef<CreateForm["scope"]>("OWNER");
  const pending = useRef<{
    key: string;
    name: string;
    ownerId: string;
    tab: CreatableTab;
    type?: RowType;
  }>();
  // Spec 054: the "Created in this import" dialog (`list`) and the category being deleted (`id`).
  const [deleteDialog, setDeleteDialog] = useState<{
    id?: string;
    list: boolean;
  }>();
  const deleting = useRef<string[]>([]);
  // Spec 048 FR 29: the value just matched blinks for 2 s; the left list keeps its place.
  const [highlightKey, setHighlightKey] = useState<string>();
  const leftScroll = useRef<ScrollView>(null);
  const rowOffsets = useRef<Record<string, number>>({});
  const listOffset = useRef(0);
  const activeTab = tab && wizard.tabs.includes(tab) ? tab : wizard.tabs[0];
  const entries: ValueEntry[] = activeTab
    ? (wizard.entries[activeTab] ?? [])
    : [];
  const { catalog } = wizard;

  // The records of the owner an entry is matched in (Personal and families can be mixed in one file).
  function recordsOf(ownerId?: string) {
    return catalog[ownerId ?? wizard.ownerId] ?? NO_RECORDS;
  }

  const createMutation = useMutation<CreateRequest, string[]>({
    cacheKey: ["financial.import_create_record"],
    fetch: async (request) => {
      const base = {
        owner:
          wizard.owners.find((item) => item.id === request.ownerId)?.type ??
          "USER",
        ownerId: request.ownerId,
      };
      const { form: values, tab: kind } = request;
      const allScopes = kind === "category" && values.scope === "ALL";

      if (kind === "category") {
        // A path ("Finanças > Investimentos") creates every level that is missing, inside each other.
        const levels = await createCategoryChain(
          splitCategoryPath(values.name),
          request.ownerId,
          {
            depthLevel: request.parentDepth,
            parentId: values.parentId || undefined,
          },
          {
            create: async ({ all, ...level }) =>
              useCases.createFinancialCategoryUseCase.execute({
                ...(all ? { owner: "ALL", ownerId: undefined } : base),
                ...IMPORTED_CATEGORY_DEFAULTS,
                ...level,
                type: values.type,
              }),
            // Every owner: the category lists share one cache entry, a narrower read would leave the others out of it.
            list: async () =>
              useCases.getFinancialCategoriesUseCase.execute(
                wizard.owners.map((item) => item.id),
              ),
          },
          allScopes ? "ALL" : "OWNER",
          values.type,
        );

        await invalidateFetcherData();

        return levels.map((level) => level.id);
      } else if (kind === "account") {
        await useCases.createFinancialAccountUseCase.execute({
          ...base,
          balance: 0,
          icon: "bank",
          name: values.name.trim(),
          status: "ACTIVE",
        });
      } else {
        await useCases.createFinancialCreditCardUseCase.execute({
          ...base,
          ...IMPORTED_CARD_DEFAULTS,
          closingDay: Number(values.closingDay),
          dueDay: Number(values.dueDay),
          limit: values.limitCents,
          title: values.name.trim(),
        });
      }

      // The lists of the wizard follow the cache: the new record shows up in `records` and is selected then.
      await invalidateFetcherData();

      return [];
    },
  });

  const deleteMutation = useMutation<{ id: string; ownerId: string }, void>({
    cacheKey: ["financial.import_delete_category"],
    fetch: async (request) => {
      await useCases.deleteFinancialCategoryUseCase.execute(request);
      await invalidateFetcherData();
    },
  });

  // The created record is selected for the value once the refreshed lists have it (FR 25).
  useEffect(() => {
    const waiting = pending.current;

    if (!waiting) {
      return;
    }

    const records = recordsOf(waiting.ownerId);
    const list =
      waiting.tab === "category"
        ? records.categories
            .filter((item) => !waiting.type || item.type === waiting.type)
            .map((item) => ({
              id: item.id,
              names: [item.path, item.name],
            }))
        : (waiting.tab === "account" ? records.accounts : records.cards).map(
            (item) => ({
              id: item.id,
              names: [item.name],
            }),
          );
    const id = autoMatch(waiting.name, list);

    if (id) {
      wizard.onValueChoice(waiting.tab, waiting.key, id);
      pending.current = undefined;
    }
  }, [catalog]);

  const created = createMutation.status === "success";
  const deleted = deleteMutation.status === "success";

  // Spec 054 FR 8: after the delete the wizard drops the ids and unmatches their values.
  useEffect(() => {
    if (!deleted) {
      return;
    }

    wizard.onCategoriesDeleted(deleting.current);
    deleting.current = [];
    deleteMutation.reset();
    setDeleteDialog((current) => (current?.list ? { list: true } : undefined));
  }, [deleted]);

  useEffect(() => {
    if (!created || !creating) {
      return;
    }

    if (creating.tab === "category") {
      wizard.onCategoriesCreated(creating.ownerId, createMutation.data ?? []);
    } else {
      wizard.onCreated(COUNTED[creating.tab]);
    }
    createMutation.reset();
    setHighlightKey(creating.key);

    // FR 29: the form moves on to the next value without a match, so the user keeps creating without scrolling.
    const nextKey = nextUnmatchedKey(entries, creating.key);
    const next = entries.find((entry) => entry.key === nextKey);

    if (next) {
      onCreateOpen(creating.tab, next);
    } else {
      setCreating(undefined);
    }
  }, [created]);

  useEffect(() => {
    if (!highlightKey) {
      return undefined;
    }

    const timer = setTimeout(() => setHighlightKey(undefined), HIGHLIGHT_MS);

    return () => clearTimeout(timer);
  }, [highlightKey]);

  // FR 30 (web): Esc closes the form without creating; it must not reach the sheet, which would ask to discard.
  useEffect(() => {
    if (!creating || !isWeb() || typeof document === "undefined") {
      return undefined;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopImmediatePropagation();
        setCreating(undefined);
      }
    }

    document.addEventListener("keydown", onKeyDown, true);

    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [creating]);

  function onCreateOpen(kind: CreatableTab, entry: ValueEntry) {
    createMutation.reset();
    setForm({
      ...emptyForm(entry.value, entry.type ?? "EXPENSE"),
      scope: lastScope.current,
    });
    setCreating({
      key: entry.key,
      ownerId: entry.ownerId ?? wizard.ownerId,
      tab: kind,
      type: entry.type,
      value: entry.value,
    });
  }

  // The records a value can be matched to; a category only to categories of the type of its rows.
  function optionsFor(entry: ValueEntry): { label: string; value: string }[] {
    if (!activeTab) {
      return [];
    }

    if (activeTab === "owner") {
      return wizard.owners
        .filter((item) => !item.archived)
        .map((item) => ({ label: item.name, value: item.id }));
    }
    const records = recordsOf(entry.ownerId);

    if (activeTab === "category") {
      return records.categories
        .filter((item) => !entry.type || item.type === entry.type)
        .map((item) => ({ label: item.path, value: item.id }));
    }
    if (activeTab === "account") {
      return records.accounts.map((item) => ({
        label: item.name,
        value: item.id,
      }));
    }
    if (activeTab === "card") {
      return records.cards.map((item) => ({
        label: item.name,
        value: item.id,
      }));
    }

    return [];
  }

  function hasExactMatch(entry: ValueEntry) {
    const records = recordsOf(entry.ownerId);

    if (activeTab === "category") {
      return (
        !!autoMatch(
          entry.value,
          records.categories
            .filter((item) => !entry.type || item.type === entry.type)
            .map((item) => ({ id: item.id, names: [item.name, item.path] })),
        ) ||
        (!!entry.type &&
          (entry.cardRows ?? 0) > 0 &&
          !!matchCreditCategory(entry.value, entry.type))
      );
    }

    const list = activeTab === "account" ? records.accounts : records.cards;

    return !!autoMatch(
      entry.value,
      list.map((item) => ({ id: item.id, names: [item.name] })),
    );
  }

  const categoryEntries = wizard.entries.category ?? [];
  const createdItems = createdList(
    wizard.createdCategories,
    catalog,
    categoryEntries,
  );
  const createdIds = new Set(wizard.createdCategories.map((item) => item.id));
  const deleteItem = createdItems.find((item) => item.id === deleteDialog?.id);
  const plan = deleteItem
    ? deletionPlan(
        deleteItem.id,
        recordsOf(deleteItem.ownerId).categories,
        categoryEntries,
      )
    : undefined;

  const kind = creating?.tab;
  const parentOptions =
    kind === "category"
      ? recordsOf(creating?.ownerId)
          .categories.filter(
            (item) =>
              item.type === form.type &&
              // A child follows the scope of its parent (spec 038, FR 29b).
              (item.scope === "ALL") === (form.scope === "ALL"),
          )
          .map((item) => ({ label: item.path, value: item.id }))
      : [];
  const parent = recordsOf(creating?.ownerId).categories.find(
    (item) => item.id === form.parentId,
  );
  const formValid =
    form.name.trim() !== "" &&
    (kind !== "card" || (validDay(form.closingDay) && validDay(form.dueDay)));

  return {
    activeTab,
    allMatched: entries.length > 0 && unmatchedCount(entries) === 0,
    create: CREATE,
    createdItems,
    creating,
    deleteFailed: !!deleteMutation.error,
    deleteItem,
    deletePlan: plan,
    dialog: deleteDialog,
    entries,
    form,
    formValid,
    hasExactMatch,
    hasUnmatched: unmatchedCount(entries) > 0,
    highlightKey,
    isCreatable: activeTab ? isCreatable(activeTab) : false,
    isCreatedMatch: (entry: ValueEntry) =>
      activeTab === "category" &&
      entry.selected !== undefined &&
      createdIds.has(entry.selected),
    isDeleting: deleteMutation.isFetching,
    isSaving: createMutation.isFetching,
    leftScroll,
    multiOwner: wizard.owners.length > 1,
    onChoice: (entry: ValueEntry, selected: string) => {
      if (!activeTab) {
        return;
      }

      if (selected === CREATE && isCreatable(activeTab)) {
        onCreateOpen(activeTab, entry);

        return;
      }

      wizard.onValueChoice(activeTab, entry.key, selected);
    },
    onCreateCancel: () => setCreating(undefined),
    onCreatedClose: () => {
      deleteMutation.reset();
      setDeleteDialog(undefined);
    },
    onCreatedOpen: () => setDeleteDialog({ list: true }),
    onCreateSubmit: () => {
      if (!creating || !formValid) {
        return;
      }

      pending.current = {
        key: creating.key,
        name: form.name.trim(),
        ownerId: creating.ownerId,
        tab: creating.tab,
        type: creating.type,
      };
      createMutation.mutate({
        form,
        ownerId: creating.ownerId,
        parentDepth: parent ? parent.depthLevel + 1 : 0,
        tab: creating.tab,
      });
    },
    onDeleteCancel: () => {
      deleteMutation.reset();
      setDeleteDialog((current) =>
        current?.list ? { list: true } : undefined,
      );
    },
    onDeleteConfirm: () => {
      if (!deleteItem || !plan || deleteMutation.isFetching) {
        return;
      }

      deleting.current = plan.ids;
      deleteMutation.mutate({ id: deleteItem.id, ownerId: deleteItem.ownerId });
    },
    onDeleteOpen: (id: string) => {
      deleteMutation.reset();
      setDeleteDialog((current) => ({ id, list: current?.list ?? false }));
    },
    onFormChange: (next: Partial<CreateForm>) => {
      if (next.scope) {
        lastScope.current = next.scope;
      }

      setForm({ ...form, ...next });
    },
    // Called by the list container and by each row with its position (the "Next without match" button scrolls to it).
    onListLayout: (y: number) => {
      listOffset.current = y;
    },
    onNextUnmatched: () => {
      const key = nextUnmatchedKey(entries);
      const y = key === undefined ? undefined : rowOffsets.current[key];

      if (key !== undefined && y !== undefined) {
        leftScroll.current?.scrollTo({
          animated: true,
          y: Math.max(LIST_PADDING + listOffset.current + y - ROW_AIR, 0),
        });
        setHighlightKey(key);
      }
    },
    onRowLayout: (key: string, y: number) => {
      rowOffsets.current[key] = y;
    },
    onTabChange: (next: string) => {
      setCreating(undefined);
      setTab(next as ValueTab);
    },
    optionsFor,
    ownerName:
      wizard.owners.find((item) => item.id === creating?.ownerId)?.name ?? "",
    ownerNames: Object.fromEntries(
      wizard.owners.map((item) => [item.id, item.name]),
    ),
    parentOptions,
    saveFailed: !!createMutation.error,
    tabs: wizard.tabs.map((value) => ({
      unmatched: unmatchedCount(wizard.entries[value] ?? []),
      value,
    })),
    typeFromRows: !!creating?.type,
  };
}

function validDay(text: string) {
  const day = Number(text);

  return Number.isInteger(day) && day >= 1 && day <= 31;
}

export type { CreateForm };
export { CREATE };
export default useValuesStepViewModel;
