import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { StockCategoryDTO } from "@application/dto/stock/StockCatalogDTO";
import StockDTO from "@application/dto/stock/StockDTO";
import { useCases } from "@application/useCases";
import { StockMovementTypes } from "@domain/entities/stock/StockMovementEntity";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import { useTranslationLocale } from "@presentation/i18n";
import { useBreakpoint } from "@presentation/theme";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";
import NewStockItemUIModel from "@screens/Stock/modals/NewStockItemModal/models/NewStockItemUIModel";
import { formatQuantity } from "@screens/Stock/models/quantityFormat";

import useBarcodeField from "./useBarcodeField";
import useForm, {
  buildCreateParams,
  buildUpdateParams,
  valuesFromItem,
} from "./useForm";
import useItemSuggestions from "./useItemSuggestions";

export type NewStockItemVM = ReturnType<typeof useNewStockItemViewModel>;

const SUGGESTION_DEBOUNCE_MS = 300;
const MIN_SUGGESTION_CHARS = 2;

interface OwnerCatalog {
  categories: Array<{ label: string; value: string }>;
  defaultListName?: string;
  locations: Array<{ label: string; value: string }>;
  // Active lists of the owner (spec 118 FR 6) and the name of its default one.
  shoppingLists: Array<{ label: string; value: string }>;
}

function flatten(
  nodes: StockCategoryDTO[],
  prefix = "",
): Array<{ label: string; value: string }> {
  return nodes
    .filter((node) => node.status === "ACTIVE")
    .flatMap((node) => {
      const label = prefix ? `${prefix} › ${node.name}` : node.name;

      return [{ label, value: node.id }, ...flatten(node.children, label)];
    });
}

export default useNewStockItemViewModel;

function useNewStockItemViewModel() {
  const { closeModal, replaceModal } = useModalNavigation();
  const params = useLocalSearchParams<{
    // Spec 121: "1" asks the AI to fill the form from the typed name (quick add "Criar com IA").
    ai?: string;
    barcode?: string;
    description?: string;
    itemId?: string;
    ownerId?: string;
  }>();
  const { getLocale } = useTranslationLocale();
  // Spec 037 FR 13b: the extra fields sit in the right column on wide, so they
  // start open there. Read once on mount; a later resize does not toggle it.
  const isWide = useBreakpoint() !== "compact";
  const [isMoreOpen, setIsMoreOpen] = useState(isWide);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const [debouncedName, setDebouncedName] = useState("");
  const isEdit = !!params.itemId;

  const owners = useActiveOwners();
  const item = useQuery<StockDTO>({
    cacheKey: [useCases.getStockItemUseCase.uniqueName, params.itemId ?? ""],
    enabled: isEdit,
    fetch: async () =>
      useCases.getStockItemUseCase.execute({ id: params.itemId as string }),
  });
  const addStock = useMutation({
    cacheKey: [useCases.createStockItemUseCase.uniqueName],
    fetch: useCases.createStockItemUseCase.execute,
  });
  const updateStock = useMutation({
    cacheKey: [useCases.updateStockItemUseCase.uniqueName],
    fetch: useCases.updateStockItemUseCase.execute,
  });
  const save = isEdit ? updateStock : addStock;

  const model = useMemo(
    () =>
      owners.data?.length
        ? new NewStockItemUIModel(owners.data, params.ownerId)
        : undefined,
    [owners.data, params.ownerId],
  );
  const stored = useMemo(
    () => (item.data ? valuesFromItem(item.data) : undefined),
    [item.data],
  );
  const form = useForm(model?.defaultOwnerId, stored);
  // Spec 117 FR 18: "Nada encontrado" opens the form with the typed name.
  useEffect(() => {
    if (!isEdit && params.description) {
      form.setField("description", params.description);
    }
  }, [params.description]);
  // Spec 121 FR 12: a code from the reader arrives in its field.
  useEffect(() => {
    if (!isEdit && params.barcode) {
      form.setField("barcode", params.barcode);
    }
  }, [params.barcode]);
  const ownerId = form.values.ownerId ?? model?.defaultOwnerId;
  const ownerKind = ownerId && model ? model.ownerType(ownerId) : undefined;
  const aiSuggestions = useItemSuggestions({
    autoName: params.ai ? params.description : undefined,
    barcode: isEdit ? undefined : params.barcode,
    enabled: !isEdit && !!ownerKind,
    locale: getLocale().languageTag,
    owner: ownerKind,
    ownerId,
    setField: form.setField,
    values: form.values,
  });
  const barcodeField = useBarcodeField({
    itemId: params.itemId,
    ownerId,
    saveError: save.error,
    setBarcode: (code) => form.setField("barcode", code),
  });

  // Categories and locations of the owner being chosen (an item only takes its own owner's, FR "Ownership").
  const catalog = useQuery<OwnerCatalog>({
    cacheKey: [
      useCases.getStockCategoriesUseCase.uniqueName,
      "form",
      ownerId ?? "",
    ],
    enabled: !!ownerId && !!ownerKind,
    fetch: async () => {
      const query = { owner: ownerKind as string, ownerId: ownerId as string };
      const [categories, locations, lists] = await Promise.all([
        useCases.getStockCategoriesUseCase.execute(query),
        useCases.getStockLocationsUseCase.execute(query),
        useCases.getShoppingListsUseCase.execute({
          ownerId: ownerId as string,
        }),
      ]);
      const active = lists.filter((list) => list.status === "ACTIVE");

      return {
        categories: flatten(categories),
        defaultListName: active.find((list) => list.isDefault)?.name,
        locations: locations
          .filter((location) => location.status === "ACTIVE")
          .map((location) => ({ label: location.name, value: location.id })),
        shoppingLists: active
          .filter((list) => !list.isDefault)
          .map((list) => ({ label: list.name, value: list.id })),
      };
    },
  });

  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedName(form.values.description.trim()),
      SUGGESTION_DEBOUNCE_MS,
    );

    return () => clearTimeout(timeout);
  }, [form.values.description]);

  // "Already in stock, add to it?" (spec 116 FR 28): only while creating and from 2 characters.
  const suggestions = useQuery({
    cacheKey: [
      useCases.suggestStockItemsUseCase.uniqueName,
      ownerId ?? "",
      debouncedName,
    ],
    enabled:
      !isEdit &&
      !!ownerId &&
      !!ownerKind &&
      debouncedName.length >= MIN_SUGGESTION_CHARS,
    fetch: async () =>
      useCases.suggestStockItemsUseCase.execute({
        owner: ownerKind as string,
        ownerId: ownerId as string,
        q: debouncedName,
      }),
  });
  const suggestion = suggestions.data?.[0];

  // Spec 121 FR 16: the name matches an item that has no code yet: offer to give it this code.
  const linkItem = useQuery<StockDTO>({
    cacheKey: [useCases.getStockItemUseCase.uniqueName, suggestion?.id ?? ""],
    enabled: !isEdit && !!form.values.barcode && !!suggestion,
    fetch: async () =>
      useCases.getStockItemUseCase.execute({ id: suggestion?.id as string }),
  });
  const linkMutation = useMutation({
    cacheKey: [useCases.updateStockItemUseCase.uniqueName, "link-code"],
    fetch: useCases.updateStockItemUseCase.execute,
  });
  const [isLinking, setIsLinking] = useState(false);
  const linkable =
    linkItem.data && !linkItem.data.barcode ? linkItem.data : undefined;

  useEffect(() => {
    if (isLinking && linkMutation.status === "success") {
      void invalidateFetcherData([useCases.getStockItemsUseCase.uniqueName]);
      replaceModal("stock_barcode", {
        code: form.values.barcode,
        ownerId: params.ownerId,
      });
    }
  }, [isLinking, linkMutation.status]);

  function onLinkCode() {
    if (!linkable || !ownerId) {
      return;
    }

    setIsLinking(true);
    linkMutation.mutate({
      barcode: form.values.barcode,
      id: linkable.id,
      previousOwnerId: ownerId,
    });
  }

  function onOpenExistingItem() {
    replaceModal("stock_barcode", {
      code: form.values.barcode,
      ownerId: params.ownerId,
    });
  }

  // Editing a field drops its "Open Food Facts" / "IA" badge (FR 15).
  function setField<K extends keyof typeof form.values>(
    field: K,
    value: (typeof form.values)[K],
  ) {
    form.setField(field, value);
    aiSuggestions.clearSource(field as never);

    if (field === "barcode") {
      barcodeField.onTyped();
    }
  }

  const moved =
    isEdit && !!item.data && !!ownerId && ownerId !== item.data.ownerId;
  const preview = useQuery({
    cacheKey: [
      useCases.getOwnerChangePreviewUseCase.uniqueName,
      params.itemId ?? "",
      ownerId ?? "",
    ],
    enabled: moved && !!ownerKind,
    fetch: async () =>
      useCases.getOwnerChangePreviewUseCase.execute({
        itemId: params.itemId as string,
        owner: ownerKind as string,
        ownerId: ownerId as string,
      }),
  });

  useEffect(() => {
    if (save.status === "success") {
      void invalidateFetcherData([useCases.getStockItemUseCase.uniqueName]);
      closeModal();
    }
  }, [save.status]);

  function onSave() {
    if (save.isFetching || !owners.data || !form.isValid()) {
      return;
    }

    if (isEdit && item.data) {
      updateStock.mutate(
        buildUpdateParams(form.values, item.data, owners.data),
      );
      return;
    }

    addStock.mutate(
      buildCreateParams(form.values, owners.data, model?.defaultOwnerId ?? ""),
    );
  }

  function onClose() {
    if (form.isDirty) {
      setIsDiscardOpen(true);
      return;
    }

    closeModal();
  }

  function onOwnerChange(value: string) {
    // Categories and locations belong to an owner: the old picks no longer apply.
    form.setField("ownerId", value);
    form.setField("categoryId", undefined);
    form.setField("locationId", undefined);
  }

  function onAddToSuggestion() {
    if (suggestion && ownerId) {
      replaceModal("stock_movement", {
        itemId: suggestion.id,
        ownerId,
        type: StockMovementTypes.ENTRY,
      });
    }
  }

  const locale = getLocale().languageTag;

  return {
    ai: aiSuggestions,
    barcodeField,
    catalog: catalog.data,
    errors: form.errors,
    formErrorKey:
      save.status === "error" ? ("common.errors.generic" as const) : undefined,
    isDiscardOpen,
    isEdit,
    isLoading:
      (owners.isFetching && !owners.data) ||
      (isEdit && item.isFetching && !item.data),
    isMoreOpen,
    isSaving: save.isFetching,
    linkName: linkable?.description,
    model,
    onAddToSuggestion,
    onClose,
    onDiscard: () => closeModal(),
    onKeepEditing: () => setIsDiscardOpen(false),
    onLinkCode,
    onOpenExistingItem,
    onOwnerChange,
    onSave,
    onToggleMore: () => setIsMoreOpen((open) => !open),
    ownerChangePreview: moved ? preview.data : undefined,
    setField,
    suggestion: suggestion
      ? {
          name: suggestion.description,
          quantity: (() => {
            const display = formatQuantity(
              suggestion.quantity,
              suggestion.unit as StockDTO["unit"],
              locale,
            );

            return { text: display.text, unitKey: display.unitKey };
          })(),
        }
      : undefined,
    values: form.values,
  };
}
