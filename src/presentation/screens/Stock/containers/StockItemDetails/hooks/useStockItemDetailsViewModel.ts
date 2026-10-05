import { useEffect, useState } from "react";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";
import StockItemUIModel from "@screens/Stock/models/StockItemUIModel";

export interface Props {
  item: StockItemUIModel;
  onClose: () => void;
  onDeleted: () => void;
}

function useStockItemDetailsViewModel(props: Props) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const deleteItem = useMutation({
    cacheKey: [useCases.deleteStockItemUseCase.uniqueName],
    fetch: useCases.deleteStockItemUseCase.execute,
  });

  useEffect(() => {
    if (deleteItem.status === "success") {
      setIsConfirmOpen(false);
      props.onDeleted();
    }

    if (deleteItem.status === "error") {
      setIsConfirmOpen(false);
    }
  }, [deleteItem.status]);

  function onConfirmDelete() {
    if (deleteItem.isFetching) {
      return;
    }

    deleteItem.mutate({ id: props.item.id, ownerId: props.item.ownerId });
  }

  return {
    errorKey:
      deleteItem.status === "error"
        ? ("common.errors.generic" as const)
        : undefined,
    isConfirmOpen,
    isDeleting: deleteItem.isFetching,
    onCancelDelete: () => setIsConfirmOpen(false),
    onConfirmDelete,
    onDeletePress: () => setIsConfirmOpen(true),
  };
}

export default useStockItemDetailsViewModel;
