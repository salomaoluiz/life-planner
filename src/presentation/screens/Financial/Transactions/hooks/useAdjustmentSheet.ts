import { useEffect, useState } from "react";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";

import TransactionUIModel from "../models/TransactionUIModel";

interface Props {
  onDeleted: () => void;
}

// A balance adjustment cannot be edited (the API answers 422): tapping its row opens a sheet
// whose only action is Delete, which reverses its effect on the account balance.
function useAdjustmentSheet(props: Props) {
  const [item, setItem] = useState<TransactionUIModel>();
  const [attempted, setAttempted] = useState(false);

  const deleteMutation = useMutation({
    cacheKey: [useCases.deleteFinancialTransactionUseCase.uniqueName],
    fetch: useCases.deleteFinancialTransactionUseCase.execute,
  });

  useEffect(() => {
    if (deleteMutation.status === "success") {
      setItem(undefined);
      props.onDeleted();
    }
  }, [deleteMutation.status]);

  return {
    errorKey: attempted
      ? getFinancialErrorMessageKey(deleteMutation.error)
      : undefined,
    isDeleting: deleteMutation.isFetching,
    item,
    onClose: () => {
      setAttempted(false);
      setItem(undefined);
    },
    onDelete: () => {
      if (!item) {
        return;
      }
      setAttempted(true);
      deleteMutation.mutate({ id: item.id, ownerId: item.ownerId });
    },
    onOpen: (next: TransactionUIModel) => {
      setAttempted(false);
      setItem(next);
    },
  };
}

export default useAdjustmentSheet;
