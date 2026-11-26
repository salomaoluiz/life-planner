import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { invalidateFetcherData, useMutation } from "@infrastructure/fetcher";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import useReadOnlyScope from "@screens/Financial/hooks/useReadOnlyScope";
import {
  ALL_OWNERS,
  archivedOwnerIds,
  buildOwnerFilterChoices,
  personalOwnerId,
} from "@screens/Financial/models/ownerOptions";

import {
  buildCatalogEntries,
  CatalogNode,
  nodesInScope,
} from "../models/catalogEntries";
import { findNode, walk } from "../models/catalogParents";

interface CatalogData {
  categories: CatalogNode[];
  locations: CatalogNode[];
  owners: OwnerDTO[];
}

type CatalogTab = "categories" | "locations";

interface Editor {
  id?: string;
  kind: "category" | "location";
  ownerId: string;
  ownerKind: string;
  parentId?: string;
}

// FR 2: the tab and the owner chip are remembered for the session.
const session: { ownerFilter: string; tab: CatalogTab } = {
  ownerFilter: ALL_OWNERS,
  tab: "categories",
};

export type StockCatalogScreenVM = ReturnType<
  typeof useStockCatalogScreenViewModel
>;

// One call per resource reads every owner the user can read ("Todos"); the chips filter in memory.
export async function fetchCatalog(owners: OwnerDTO[]): Promise<CatalogData> {
  const [categories, locations] = await Promise.all([
    useCases.getStockCategoriesUseCase.execute({ includeArchived: true }),
    useCases.getStockLocationsUseCase.execute({ includeArchived: true }),
  ]);

  return { categories, locations, owners };
}

export default useStockCatalogScreenViewModel;

function ownerKind(owner: OwnerDTO) {
  return owner.type === OwnerType.FAMILY ? "FAMILY" : "USER";
}

// Spec 125: "Categorias e locais" as a screen with the tabs Categorias | Locais, like Finance > Categories.
function useStockCatalogScreenViewModel() {
  const isFocused = useIsFocused();
  const [tab, setTab] = useState<CatalogTab>(session.tab);
  const [ownerFilter, setOwnerFilter] = useState(session.ownerFilter);
  const [archivedExpanded, setArchivedExpanded] = useState(false);
  const [editor, setEditor] = useState<Editor | undefined>();
  const [deleting, setDeleting] = useState<
    undefined | { id: string; kind: "category" | "location" }
  >();
  const [printOpen, setPrintOpen] = useState(false);
  // Suggestions the user unchecked, per owner (FR 24).
  const [unchecked, setUnchecked] = useState<Record<string, string[]>>({});

  const query = useOwnerScopedQuery<CatalogData>({
    cacheKey: [useCases.getStockCategoriesUseCase.uniqueName, "catalog"],
    fetch: fetchCatalog,
  });
  const owners = query.data?.owners;
  const scope = useReadOnlyScope(owners, ownerFilter);
  const suggestCategories = useMutation({
    cacheKey: [useCases.createStockCategorySuggestionsUseCase.uniqueName],
    fetch: useCases.createStockCategorySuggestionsUseCase.execute,
  });
  const suggestLocations = useMutation({
    cacheKey: [useCases.createStockLocationSuggestionsUseCase.uniqueName],
    fetch: useCases.createStockLocationSuggestionsUseCase.execute,
  });

  useEffect(() => {
    if (isFocused) {
      void query.refetch();
    }
  }, [isFocused]);

  useEffect(() => {
    if (
      suggestCategories.status === "success" ||
      suggestLocations.status === "success"
    ) {
      suggestCategories.reset();
      suggestLocations.reset();
      void refreshCatalog();
    }
  }, [suggestCategories.status, suggestLocations.status]);

  // FR 3: the finance category of a category with its own mapping ("→ Alimentação › Mercado").
  const hasMapping = (query.data?.categories ?? []).some((node) =>
    walk([node]).some((entry) => !!entry.node.financeCategoryId),
  );
  const finance = useOwnerScopedQuery<CategoryDTO[]>({
    cacheKey: [
      useCases.getFinancialCategoriesUseCase.uniqueName,
      "stock-catalog",
    ],
    enabled: tab === "categories" && hasMapping,
    fetch: async (list) =>
      useCases.getFinancialCategoriesUseCase.execute(
        list.map((owner) => owner.id),
      ),
  });
  const financeLabels = useMemo(() => {
    const byId = new Map((finance.data ?? []).map((item) => [item.id, item]));

    function path(id: string): string {
      const item = byId.get(id);

      return item?.parentId
        ? `${path(item.parentId)} › ${item.name}`
        : (item?.name ?? "");
    }

    return new Map([...byId.keys()].map((id) => [id, path(id)]));
  }, [finance.data]);

  const archivedIds = useMemo(() => archivedOwnerIds(owners ?? []), [owners]);
  const allNodes =
    (tab === "categories" ? query.data?.categories : query.data?.locations) ??
    [];
  const scoped = useMemo(
    () => nodesInScope(allNodes, ownerFilter, ALL_OWNERS, archivedIds),
    [allNodes, ownerFilter, archivedIds],
  );
  const entries = useMemo(
    () => buildCatalogEntries(scoped, archivedExpanded),
    [scoped, archivedExpanded],
  );

  // FR 24: the owners in view that have no row of this tab; each gets its own suggestions block.
  const emptyOwners = useMemo(() => {
    const visible = (owners ?? []).filter((owner) =>
      ownerFilter === ALL_OWNERS
        ? !owner.archived
        : owner.id === ownerFilter && !owner.archived,
    );

    return visible
      .filter((owner) => !allNodes.some((node) => node.ownerId === owner.id))
      .map((owner) => ({
        id: owner.id,
        isPersonal: owner.type === OwnerType.USER,
        kind: ownerKind(owner),
        name: owner.name,
      }));
  }, [owners, ownerFilter, allNodes]);

  async function refreshCatalog() {
    await invalidateFetcherData([
      useCases.getStockCategoriesUseCase.uniqueName,
    ]);
    await query.refetch();
  }

  function defaultOwnerId() {
    return (
      (ownerFilter !== ALL_OWNERS ? ownerFilter : undefined) ??
      personalOwnerId(owners ?? []) ??
      ""
    );
  }

  function openEditor(
    next: Omit<Editor, "kind" | "ownerId" | "ownerKind"> & {
      ownerId?: string;
    },
  ) {
    const ownerId = next.ownerId ?? defaultOwnerId();
    const owner = (owners ?? []).find((item) => item.id === ownerId);

    setEditor({
      ...next,
      kind: tab === "categories" ? "category" : "location",
      ownerId,
      ownerKind: owner ? ownerKind(owner) : "USER",
    });
  }

  function rowOwner(id: string) {
    return findNode(allNodes, id)?.ownerId ?? defaultOwnerId();
  }

  const printLocations = useMemo(
    () =>
      walk(
        nodesInScope(
          query.data?.locations ?? [],
          ownerFilter,
          ALL_OWNERS,
          archivedIds,
        ),
      ).filter(({ node }) => node.status === "ACTIVE"),
    [query.data, ownerFilter, archivedIds],
  );

  function toggleSuggestion(ownerId: string, key: string) {
    setUnchecked((current) => {
      const own = current[ownerId] ?? [];

      return {
        ...current,
        [ownerId]: own.includes(key)
          ? own.filter((item) => item !== key)
          : [...own, key],
      };
    });
  }

  function createSuggestions(ownerId: string, kind: string, keys: string[]) {
    const mutation =
      tab === "categories" ? suggestCategories : suggestLocations;

    mutation.mutate({ keys, owner: kind, ownerId });
  }

  return {
    archivedExpanded,
    data: query.data,
    deleting,
    editor,
    emptyOwners,
    entries,
    errorMessage: query.error?.message,
    financeLabels,
    isBusy: suggestCategories.isFetching || suggestLocations.isFetching,
    isLoading: query.isFetching && !query.data,
    isRefreshing: query.isFetching && !!query.data,
    onAddChild: scope.guard((id: string) =>
      openEditor({ ownerId: rowOwner(id), parentId: id }),
    ),
    onAddPress: scope.guard(() => openEditor({})),
    onArchivedToggle: () => setArchivedExpanded((current) => !current),
    onCreateSuggestions: createSuggestions,
    onDeleteClose: () => setDeleting(undefined),
    onDeleted: () => {
      setDeleting(undefined);
      setEditor(undefined);
      void refreshCatalog();
    },
    onDeleteRequest: (id: string, kind: "category" | "location") => {
      setEditor(undefined);
      setDeleting({ id, kind });
    },
    onEditorClose: () => setEditor(undefined),
    onFromScratch: scope.guard((ownerId: string) => openEditor({ ownerId })),
    onOwnerFilterChange: (value: string) => {
      session.ownerFilter = value;
      setOwnerFilter(value);
    },
    onPrintClose: () => setPrintOpen(false),
    onPrintOpen: () => setPrintOpen(true),
    onRefresh: async () => query.refetch(),
    onRetry: async () => query.refetch(),
    onRowPress: scope.guard((id: string) =>
      openEditor({ id, ownerId: rowOwner(id) }),
    ),
    onSaved: () => {
      setEditor(undefined);
      void refreshCatalog();
    },
    onTabChange: (value: string) => {
      session.tab = value as CatalogTab;
      setTab(value as CatalogTab);
      setArchivedExpanded(false);
    },
    onToastHide: scope.onToastHide,
    onToggleSuggestion: toggleSuggestion,
    onViewItems: (id: string, kind: "category" | "location") => {
      setEditor(undefined);

      if (kind === "location") {
        router.push(`/stock/locations/${id}` as never);

        return;
      }

      router.push({ params: { categoryId: id }, pathname: "/stock" } as never);
    },
    ownerChoices: buildOwnerFilterChoices(owners ?? []),
    ownerFilter,
    printLocations,
    printOpen,
    readOnly: scope.readOnly,
    tab,
    toastVisible: scope.toastVisible,
    unchecked,
  };
}
