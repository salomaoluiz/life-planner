import { useEffect } from "react";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";
import FinancialTransactionViewModel from "@screens/Financial/Transactions/models/FinancialTransactionViewModel";

export interface Props {
  item: FinancialTransactionViewModel;
  refetch: () => void;
}

function useListItem(props: Props) {
  const deleteItem = useMutation({
    cacheKey: [useCases.deleteFinancialTransactionUseCase.uniqueName],
    fetch: useCases.deleteFinancialTransactionUseCase.execute,
  });

  useEffect(() => {
    if (deleteItem.status === "success") {
      props.refetch();
    }
  }, [deleteItem.status]);

  async function onDelete() {
    deleteItem.mutate({
      id: props.item.ids.transactionId,
      ownerId: props.item.ids.ownerId,
    });
  }

  return { onDelete };
}

export default useListItem;
