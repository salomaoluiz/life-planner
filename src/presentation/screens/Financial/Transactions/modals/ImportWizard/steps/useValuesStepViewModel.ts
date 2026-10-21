import { useEffect, useRef, useState } from "react";

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
  unmatchedCount,
  ValueEntry,
  ValueTab,
} from "@screens/Financial/Transactions/models/importValues";

import { ImportWizardState } from "../useImportWizardViewModel";

const CREATE = "__create__";

type CreatableTab = "account" | "card" | "category";

interface CreateForm {
  closingDay: string;
  dueDay: string;
  limitCents: number;
  name: string;
  parentId: string;
  type: RowType;
}

interface CreateRequest {
  form: CreateForm;
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
    tab: CreatableTab;
    type?: RowType;
    value: string;
  }>();
  const [form, setForm] = useState<CreateForm>(emptyForm("", "EXPENSE"));
  const pending = useRef<{
    key: string;
    name: string;
    tab: CreatableTab;
    type?: RowType;
  }>();
  const activeTab = tab && wizard.tabs.includes(tab) ? tab : wizard.tabs[0];
  const entries: ValueEntry[] = activeTab
    ? (wizard.entries[activeTab] ?? [])
    : [];
  const owner = wizard.owners.find((item) => item.id === wizard.ownerId);
  const { records } = wizard;

  const createMutation = useMutation<CreateRequest, void>({
    cacheKey: ["financial.import_create_record"],
    fetch: async (request) => {
      const base = {
        owner: owner?.type ?? "USER",
        ownerId: wizard.ownerId,
      };
      const { form: values, tab: kind } = request;

      if (kind === "category") {
        // A path ("Finanças > Investimentos") creates every level that is missing, inside each other.
        await createCategoryChain(
          splitCategoryPath(values.name),
          wizard.ownerId,
          {
            depthLevel: request.parentDepth,
            parentId: values.parentId || undefined,
          },
          {
            create: async (level) =>
              useCases.createFinancialCategoryUseCase.execute({
                ...base,
                ...IMPORTED_CATEGORY_DEFAULTS,
                ...level,
                type: values.type,
              }),
            list: async () =>
              useCases.getFinancialCategoriesUseCase.execute([wizard.ownerId]),
          },
        );
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
    },
  });

  // The created record is selected for the value once the refreshed lists have it (FR 25).
  useEffect(() => {
    const waiting = pending.current;

    if (!waiting) {
      return;
    }

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
  }, [records]);

  const created = createMutation.status === "success";

  useEffect(() => {
    if (!created || !creating) {
      return;
    }

    wizard.onCreated(COUNTED[creating.tab]);
    createMutation.reset();
    setCreating(undefined);
  }, [created]);

  function onCreateOpen(kind: CreatableTab, entry: ValueEntry) {
    createMutation.reset();
    setForm(emptyForm(entry.value, entry.type ?? "EXPENSE"));
    setCreating({
      key: entry.key,
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
    if (activeTab === "category") {
      return !!autoMatch(
        entry.value,
        records.categories
          .filter((item) => !entry.type || item.type === entry.type)
          .map((item) => ({ id: item.id, names: [item.name, item.path] })),
      );
    }

    const list = activeTab === "account" ? records.accounts : records.cards;

    return !!autoMatch(
      entry.value,
      list.map((item) => ({ id: item.id, names: [item.name] })),
    );
  }

  const kind = creating?.tab;
  const parentOptions =
    kind === "category"
      ? records.categories
          .filter((item) => item.type === form.type)
          .map((item) => ({ label: item.path, value: item.id }))
      : [];
  const parent = records.categories.find((item) => item.id === form.parentId);
  const formValid =
    form.name.trim() !== "" &&
    (kind !== "card" || (validDay(form.closingDay) && validDay(form.dueDay)));

  return {
    activeTab,
    create: CREATE,
    creating,
    entries,
    form,
    formValid,
    hasExactMatch,
    isCreatable: activeTab ? isCreatable(activeTab) : false,
    isSaving: createMutation.isFetching,
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
    onCreateSubmit: () => {
      if (!creating || !formValid) {
        return;
      }

      pending.current = {
        key: creating.key,
        name: form.name.trim(),
        tab: creating.tab,
        type: creating.type,
      };
      createMutation.mutate({
        form,
        parentDepth: parent ? parent.depthLevel + 1 : 0,
        tab: creating.tab,
      });
    },
    onFormChange: (next: Partial<CreateForm>) => setForm({ ...form, ...next }),
    onTabChange: (next: string) => {
      setCreating(undefined);
      setTab(next as ValueTab);
    },
    optionsFor,
    ownerName: owner?.name ?? "",
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
