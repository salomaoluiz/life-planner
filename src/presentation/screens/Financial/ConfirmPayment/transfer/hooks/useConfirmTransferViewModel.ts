import { useEffect, useState } from "react";

import { financeKeys } from "@application/queryKeys/financeKeys";
import { useCases } from "@application/useCases";
import { markFetcherDataStale, useQuery } from "@infrastructure/fetcher";
import { TranslationKeys } from "@presentation/i18n/types";
import {
  clearPayRequest,
  getPayRequest,
} from "@screens/Financial/ConfirmPayment/models/payRequest";
import { invalidateAfterWrite } from "@screens/Financial/Transactions/pending/writeCache";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";
import { computeRate } from "@utils/transferRate";

import {
  buildConfirmParams,
  canConfirm,
  ConfirmTransferState,
  effectiveAmountInCents,
  initialState,
  isSameCurrency,
} from "../models/confirmTransferState";

// Spec 098 FR 7: confirms ("Efetivar") a transfer from its row in the list, asking for the amount in when it is unknown.
function useConfirmTransferViewModel() {
  const { closeModal } = useModalNavigation();
  const [request] = useState(getPayRequest);
  const item = request?.item;
  const transferId = item?.transferId;
  const existing = useQuery({
    cacheKey: financeKeys.transfers.raw(transferId ?? ""),
    enabled: !!transferId,
    fetch: async () =>
      useCases.getFinancialTransferUseCase.execute(transferId!),
  });
  const transfer = existing.data?.transfer;
  const [state, setState] = useState<ConfirmTransferState>();
  const [isBlocking, setBlocking] = useState(false);
  const [errorKey, setErrorKey] = useState<TranslationKeys>();

  // A reload of the page on the modal URL loses the request: nothing to confirm.
  useEffect(() => {
    if (!item) {
      closeModal();
    }
  }, []);

  useEffect(() => {
    if (transfer && !state) {
      setState(initialState(transfer));
    }
  }, [state, transfer]);

  const sameCurrency = !transfer || isSameCurrency(transfer);
  const amountInCents = state ? effectiveAmountInCents(state, sameCurrency) : 0;
  const rate = state
    ? computeRate(state.amountOutCents, amountInCents)
    : undefined;

  function change(patch: Partial<ConfirmTransferState>) {
    setState((current) => (current ? { ...current, ...patch } : current));
    setErrorKey(undefined);
  }

  function onClose() {
    if (isBlocking) {
      return;
    }
    clearPayRequest();
    closeModal();
  }

  async function onConfirm() {
    if (!transfer || !state || isBlocking || !canConfirm(state, sameCurrency)) {
      return;
    }
    setBlocking(true);
    try {
      await useCases.updateFinancialTransferUseCase.execute(
        buildConfirmParams(transfer, state),
      );
      await invalidateAfterWrite(
        { invoiceMonths: "all", listMonths: "all", projections: true },
        { refetch: false },
      );
      markFetcherDataStale(financeKeys.transfers.all());
      clearPayRequest();
      closeModal();
    } catch (error) {
      setErrorKey(
        getFinancialErrorMessageKey(error) ?? "common.errors.generic",
      );
    } finally {
      setBlocking(false);
    }
  }

  return {
    amountInCents,
    canConfirm: !!state && canConfirm(state, sameCurrency) && !isBlocking,
    errorKey,
    isAmountOutFixed: !!transfer?.recurrenceId,
    isBlocking,
    isLoading: !state,
    item,
    onAmountInChange: (cents: number) =>
      change({ amountInCents: cents, rateMode: "AMOUNT_IN", rateText: "" }),
    onAmountOutChange: (cents: number) => change({ amountOutCents: cents }),
    onClose,
    onConfirm,
    onDateInChange: (date?: Date) => date && change({ dateIn: date }),
    onDateOutChange: (date?: Date) => date && change({ dateOut: date }),
    onRateChange: (text: string) =>
      change({ rateMode: "RATE", rateText: text }),
    rate,
    sameCurrency,
    state,
    transfer,
  };
}

export default useConfirmTransferViewModel;
