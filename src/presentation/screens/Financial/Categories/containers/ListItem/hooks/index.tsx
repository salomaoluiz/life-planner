import { useEffect } from "react";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";

import FinancialCategoryViewModel from "../../../models/FinancialCategoryViewModel";

export interface Props {
  item: FinancialCategoryViewModel;
  refetch: () => void;
}

function useListItem(props: Props) {
  const deleteItem = useMutation({
    cacheKey: [useCases.deleteFinancialCategoryUseCase.uniqueName],
    fetch: useCases.deleteFinancialCategoryUseCase.execute,
  });

  useEffect(() => {
    if (deleteItem.status === "success") {
      props.refetch();
    }
  }, [deleteItem.status]);

  async function onDelete() {
    deleteItem.mutate({
      id: props.item.id,
      ownerId: props.item.ownerId,
    });
  }

  return { onDelete };
}

export default useListItem;
