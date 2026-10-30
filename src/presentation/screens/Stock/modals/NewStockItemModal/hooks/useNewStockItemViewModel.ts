import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";
import { useBreakpoint } from "@presentation/theme";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";
import NewStockItemUIModel from "@screens/Stock/modals/NewStockItemModal/models/NewStockItemUIModel";

import useForm from "./useForm";

function useNewStockItemViewModel() {
  const { closeModal } = useModalNavigation();
  const params = useLocalSearchParams<{ ownerId?: string }>();
  // Spec 037 FR 13b: the extra fields sit in the right column on wide, so they
  // start open there. Read once on mount; a later resize does not toggle it.
  const isWide = useBreakpoint() !== "compact";
  const [isMoreOpen, setIsMoreOpen] = useState(isWide);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);

  const owners = useActiveOwners();
  const addStock = useMutation({
    cacheKey: [useCases.createStockItemUseCase.uniqueName],
    fetch: useCases.createStockItemUseCase.execute,
  });

  const model = useMemo(
    () =>
      owners.data?.length
        ? new NewStockItemUIModel(owners.data, params.ownerId)
        : undefined,
    [owners.data, params.ownerId],
  );
  const form = useForm(model?.defaultOwnerId);

  useEffect(() => {
    if (addStock.status === "success") {
      closeModal();
    }
  }, [addStock.status]);

  function onSave() {
    if (addStock.isFetching || !owners.data) {
      return;
    }

    const stockParams = form.submit(owners.data);

    if (stockParams) {
      addStock.mutate(stockParams);
    }
  }

  function onClose() {
    if (form.isDirty) {
      setIsDiscardOpen(true);
      return;
    }

    closeModal();
  }

  return {
    errors: form.errors,
    formErrorKey:
      addStock.status === "error"
        ? ("common.errors.generic" as const)
        : undefined,
    isDiscardOpen,
    isLoading: owners.isFetching && !owners.data,
    isMoreOpen,
    isSaving: addStock.isFetching,
    model,
    onClose,
    onDiscard: () => closeModal(),
    onKeepEditing: () => setIsDiscardOpen(false),
    onSave,
    onToggleMore: () => setIsMoreOpen((open) => !open),
    setField: form.setField,
    values: form.values,
  };
}

export default useNewStockItemViewModel;
