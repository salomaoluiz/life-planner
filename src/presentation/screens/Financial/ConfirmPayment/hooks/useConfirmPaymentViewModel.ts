import { useEffect, useRef, useState } from "react";

import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";
import { decimalStringToCents } from "@utils/money";

import {
  DateChoice,
  dateChoices,
  differenceCents,
  isValidPayment,
  overdueDays,
  resolveDate,
} from "../models/confirmPayState";
import { clearPayRequest, getPayRequest } from "../models/payRequest";
import submitPayment from "./submitPayment";

function startOfToday() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// Spec 097: confirms ("Efetivar" / "Receber") an unpaid account row with the value and date really paid.
function useConfirmPaymentViewModel() {
  const { closeModal } = useModalNavigation();
  const [request] = useState(getPayRequest);
  const item = request?.item;
  const [today] = useState(startOfToday);
  const [cents, setCents] = useState(
    request?.draft?.cents ??
      (item ? Math.abs(decimalStringToCents(item.value)) : 0),
  );
  const [choice, setChoice] = useState<DateChoice>(
    request?.draft?.choice ?? "transaction",
  );
  const [other, setOther] = useState(request?.draft?.other);
  const [submitted, setSubmitted] = useState(false);
  const confirmed = useRef(false);
  const transactionDate = item ? new Date(item.date) : today;
  const originalCents = item ? Math.abs(decimalStringToCents(item.value)) : 0;

  // A reload of the page on the modal URL loses the request: nothing to confirm.
  useEffect(() => {
    if (!item) {
      closeModal();
    }
  }, []);

  function onClose() {
    clearPayRequest();
    closeModal();
  }

  function onConfirm() {
    if (!item || confirmed.current) {
      return;
    }
    setSubmitted(true);
    if (!isValidPayment(cents)) {
      return;
    }
    confirmed.current = true;
    submitPayment(item, {
      cents,
      choice,
      dateIso: resolveDate(choice, item.date, other, today),
      other,
    });
    clearPayRequest();
    closeModal();
  }

  function onChoice(next: DateChoice) {
    setChoice(next);
    if (next === "other") {
      setOther((current) => current ?? transactionDate);
    }
  }

  return {
    amountError:
      submitted && !isValidPayment(cents)
        ? ("financial.transactions.confirmPay.amountError" as const)
        : undefined,
    cents,
    choice,
    choices: dateChoices(transactionDate, today),
    differenceCents: differenceCents(cents, originalCents),
    isIncome: item?.type === "INCOME",
    isReady: !!item,
    isValid: isValidPayment(cents),
    item,
    onCentsChange: setCents,
    onChoice,
    onClose,
    onConfirm,
    onOtherDate: (date?: Date) => date && setOther(date),
    originalCents,
    otherDate: other,
    overdueDays: overdueDays(transactionDate, today),
    transactionDate,
  };
}

export default useConfirmPaymentViewModel;
