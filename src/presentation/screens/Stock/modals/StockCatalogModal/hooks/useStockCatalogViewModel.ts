import { useEffect, useMemo, useState } from "react";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import {
  StockCategoryDTO,
  StockLocationDTO,
} from "@application/dto/stock/StockCatalogDTO";
import { useCases } from "@application/useCases";
import {
  StockCategoryInUse,
  StockLocationInUse,
} from "@domain/entities/errors";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

export interface CategoryRow {
  category: StockCategoryDTO;
  depth: number;
  // "herda da mãe", the finance category name or nothing mapped.
  financeLabel?: string;
  inherits: boolean;
}

export type StockCatalogVM = ReturnType<typeof useStockCatalogViewModel>;

interface CatalogData {
  categories: StockCategoryDTO[];
  locations: StockLocationDTO[];
}

type Editor =
  | { id?: string; kind: "category"; parentId?: string }
  | { id?: string; kind: "location" };

const NO_PARENT = "";

function flatten(
  nodes: StockCategoryDTO[],
  depth = 0,
): Array<{ depth: number; node: StockCategoryDTO }> {
  return nodes.flatMap((node) => [
    { depth, node },
    ...flatten(node.children, depth + 1),
  ]);
}

export default useStockCatalogViewModel;

function useStockCatalogViewModel() {
  const { closeModal } = useModalNavigation();
  const owners = useActiveOwners();
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | undefined>();
  const [editor, setEditor] = useState<Editor | undefined>();
  // Spec 117 FR 19: the location whose QR sheet is open.
  const [qrLocation, setQrLocation] = useState<
    undefined | { id: string; name: string }
  >();
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState(NO_PARENT);
  const [financeId, setFinanceId] = useState("");
  const [deleting, setDeleting] = useState<
    undefined | { id: string; kind: "category" | "location"; name: string }
  >();
  const [inUseCount, setInUseCount] = useState<number | undefined>();

  const ownerList = owners.data ?? [];
  const owner =
    ownerList.find((item) => item.id === selectedOwnerId) ??
    ownerList.find((item) => item.type === OwnerType.USER) ??
    ownerList[0];
  const ownerKind = owner?.type === OwnerType.FAMILY ? "FAMILY" : "USER";

  const catalog = useQuery<CatalogData>({
    cacheKey: [
      useCases.getStockCategoriesUseCase.uniqueName,
      "catalog",
      owner?.id ?? "",
    ],
    enabled: !!owner,
    fetch: async () => {
      const params = {
        includeArchived: true,
        owner: ownerKind,
        ownerId: owner?.id as string,
      };
      const [categories, locations] = await Promise.all([
        useCases.getStockCategoriesUseCase.execute(params),
        useCases.getStockLocationsUseCase.execute(params),
      ]);

      return { categories, locations };
    },
  });
  const financeCategories = useQuery<CategoryDTO[]>({
    cacheKey: [
      useCases.getFinancialCategoriesUseCase.uniqueName,
      "stock-catalog",
      owner?.id ?? "",
    ],
    enabled: !!owner,
    fetch: async () =>
      useCases.getFinancialCategoriesUseCase.execute([owner?.id as string]),
  });

  const createCategory = useMutation({
    cacheKey: [useCases.createStockCategoryUseCase.uniqueName],
    fetch: useCases.createStockCategoryUseCase.execute,
  });
  const updateCategory = useMutation({
    cacheKey: [useCases.updateStockCategoryUseCase.uniqueName],
    fetch: useCases.updateStockCategoryUseCase.execute,
  });
  const deleteCategory = useMutation({
    cacheKey: [useCases.deleteStockCategoryUseCase.uniqueName],
    fetch: useCases.deleteStockCategoryUseCase.execute,
  });
  const suggestCategories = useMutation({
    cacheKey: [useCases.createStockCategorySuggestionsUseCase.uniqueName],
    fetch: useCases.createStockCategorySuggestionsUseCase.execute,
  });
  const createLocation = useMutation({
    cacheKey: [useCases.createStockLocationUseCase.uniqueName],
    fetch: useCases.createStockLocationUseCase.execute,
  });
  const updateLocation = useMutation({
    cacheKey: [useCases.updateStockLocationUseCase.uniqueName],
    fetch: useCases.updateStockLocationUseCase.execute,
  });
  const deleteLocation = useMutation({
    cacheKey: [useCases.deleteStockLocationUseCase.uniqueName],
    fetch: useCases.deleteStockLocationUseCase.execute,
  });
  const suggestLocations = useMutation({
    cacheKey: [useCases.createStockLocationSuggestionsUseCase.uniqueName],
    fetch: useCases.createStockLocationSuggestionsUseCase.execute,
  });

  const mutations = [
    createCategory,
    updateCategory,
    deleteCategory,
    suggestCategories,
    createLocation,
    updateLocation,
    deleteLocation,
    suggestLocations,
  ];

  // Every successful write refreshes the catalog and the item lists (they carry the names).
  useEffect(
    () => {
      if (mutations.some((mutation) => mutation.status === "success")) {
        mutations.forEach((mutation) => mutation.reset());
        setEditor(undefined);
        setDeleting(undefined);
        void invalidateFetcherData([
          useCases.getStockCategoriesUseCase.uniqueName,
        ]);
      }
    },
    mutations.map((mutation) => mutation.status),
  );

  useEffect(() => {
    const failed = [deleteCategory.error, deleteLocation.error].find(
      (error) =>
        error instanceof StockCategoryInUse ||
        error instanceof StockLocationInUse,
    );

    if (
      failed instanceof StockCategoryInUse ||
      failed instanceof StockLocationInUse
    ) {
      setInUseCount(failed.itemCount);
      setDeleting(undefined);
    }
  }, [deleteCategory.error, deleteLocation.error]);

  const financeOptions = useMemo(
    () =>
      (financeCategories.data ?? [])
        .filter(
          (category) =>
            category.type === "EXPENSE" && category.status === "ACTIVE",
        )
        .map((category) => ({ label: category.name, value: category.id })),
    [financeCategories.data],
  );
  function financeName(id?: string) {
    return financeOptions.find((option) => option.value === id)?.label;
  }

  const rows: CategoryRow[] = useMemo(
    () =>
      flatten(catalog.data?.categories ?? []).map(({ depth, node }) => ({
        category: node,
        depth,
        financeLabel: financeName(node.financeCategoryId),
        inherits: !node.financeCategoryId && !!node.effectiveFinanceCategoryId,
      })),
    [catalog.data, financeOptions],
  );
  const parentOptions = useMemo(
    () =>
      flatten(catalog.data?.categories ?? [])
        .filter(({ depth, node }) => node.status === "ACTIVE" && depth < 2)
        .map(({ node }) => ({ label: node.name, value: node.id })),
    [catalog.data],
  );

  function openEditor(next: Editor) {
    setInUseCount(undefined);
    setEditor(next);

    if (next.kind === "category") {
      const found = flatten(catalog.data?.categories ?? []).find(
        ({ node }) => node.id === next.id,
      )?.node;

      setName(found?.name ?? "");
      setParentId(found?.parentId ?? next.parentId ?? NO_PARENT);
      setFinanceId(found?.financeCategoryId ?? "");

      return;
    }

    setName(
      catalog.data?.locations.find((item) => item.id === next.id)?.name ?? "",
    );
  }

  function onSaveEditor() {
    if (!editor || !owner || !name.trim()) {
      return;
    }

    const target = { owner: ownerKind, ownerId: owner.id };

    if (editor.kind === "location") {
      if (editor.id) {
        updateLocation.mutate({ id: editor.id, name: name.trim() });
      } else {
        createLocation.mutate({ ...target, name: name.trim() });
      }

      return;
    }

    if (editor.id) {
      updateCategory.mutate({
        financeCategoryId: financeId || null,
        id: editor.id,
        name: name.trim(),
        parentId: parentId || null,
      });

      return;
    }

    createCategory.mutate({
      ...target,
      financeCategoryId: financeId || undefined,
      name: name.trim(),
      parentId: parentId || undefined,
    });
  }

  function onConfirmDelete() {
    if (!deleting) {
      return;
    }

    (deleting.kind === "category" ? deleteCategory : deleteLocation).mutate({
      id: deleting.id,
    });
  }

  function setStatus(
    kind: "category" | "location",
    id: string,
    archived: boolean,
  ) {
    const status = archived ? "ARCHIVED" : "ACTIVE";

    (kind === "category" ? updateCategory : updateLocation).mutate({
      id,
      status,
    });
  }

  const isBusy = mutations.some((mutation) => mutation.isFetching);

  return {
    categories: rows,
    editor,
    financeOptions,
    hasError:
      mutations.some((mutation) => mutation.status === "error") &&
      inUseCount === undefined,
    inUseCount,
    isBusy,
    isEmptyCategories:
      !catalog.isFetching && (catalog.data?.categories.length ?? 0) === 0,
    isEmptyLocations:
      !catalog.isFetching && (catalog.data?.locations.length ?? 0) === 0,
    isLoading:
      (catalog.isFetching && !catalog.data) ||
      (owners.isFetching && !owners.data),
    locations: catalog.data?.locations ?? [],
    name,
    onAddCategory: (parent?: string) =>
      openEditor({ kind: "category", parentId: parent }),
    onAddLocation: () => openEditor({ kind: "location" }),
    onCancelDelete: () => setDeleting(undefined),
    onClose: () => closeModal(),
    onConfirmDelete,
    onDelete: (kind: "category" | "location", id: string, label: string) =>
      setDeleting({ id, kind, name: label }),
    onEditCategory: (id: string) => openEditor({ id, kind: "category" }),
    onEditLocation: (id: string) => openEditor({ id, kind: "location" }),
    onEditorClose: () => setEditor(undefined),
    onFinanceChange: setFinanceId,
    onNameChange: setName,
    onOwnerChange: (id: string) => setSelectedOwnerId(id),
    onParentChange: setParentId,
    onQrClose: () => setQrLocation(undefined),
    onQrOpen: (id: string, locationName: string) =>
      setQrLocation({ id, name: locationName }),
    onRetry: async () => catalog.refetch(),
    onSaveEditor,
    onSetStatus: setStatus,
    onUseCategorySuggestions: () =>
      owner &&
      suggestCategories.mutate({ owner: ownerKind, ownerId: owner.id }),
    onUseLocationSuggestions: () =>
      owner && suggestLocations.mutate({ owner: ownerKind, ownerId: owner.id }),
    owner,
    ownerOptions: ownerList,
    parentId,
    parentOptions,
    qrLocation,
    selectedFinanceId: financeId,
    toDelete: deleting,
  };
}
