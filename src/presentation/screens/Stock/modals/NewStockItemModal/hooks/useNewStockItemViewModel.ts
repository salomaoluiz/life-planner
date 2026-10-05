import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { useCases } from "@application/useCases";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import NewStockItemUIModel from "@screens/Stock/modals/NewStockItemModal/models/NewStockItemUIModel";

import useForm from "./useForm";

function useNewStockItemViewModel() {
  const params = useLocalSearchParams<{ ownerId?: string }>();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);

  const owners = useQuery({
    cacheKey: [useCases.getOwnersUseCase.uniqueName],
    fetch: useCases.getOwnersUseCase.execute,
  });
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
      router.back();
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

    router.back();
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
    onDiscard: () => router.back(),
    onKeepEditing: () => setIsDiscardOpen(false),
    onSave,
    onToggleMore: () => setIsMoreOpen((open) => !open),
    setField: form.setField,
    values: form.values,
  };
}

export default useNewStockItemViewModel;
