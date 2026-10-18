import { useEffect, useState } from "react";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";

import TransactionUIModel from "../models/TransactionUIModel";

interface Props {
  onPaid: () => void;
}

// One tap on the row sends `{ paid: true }` without opening the form (spec 033 FR 17): the API moves
// the date to today. There is no unpay action here, only the form can turn the status off (FR 18).
function usePayTransaction(props: Props) {
  const [payingId, setPayingId] = useState<string>();
  const [hasError, setHasError] = useState(false);

  const payMutation = useMutation({
    cacheKey: [useCases.updateFinancialTransactionUseCase.uniqueName, "pay"],
    fetch: useCases.updateFinancialTransactionUseCase.execute,
  });

  useEffect(() => {
    if (payMutation.status === "success") {
      setPayingId(undefined);
      props.onPaid();
    }
    if (payMutation.status === "error") {
      setPayingId(undefined);
      setHasError(true);
    }
  }, [payMutation.status]);

  return {
    hasError,
    onPay: (item: TransactionUIModel) => {
      setHasError(false);
      setPayingId(item.id);
      payMutation.mutate({ id: item.id, ownerId: item.ownerId, paid: true });
    },
    payingId,
  };
}

export default usePayTransaction;
