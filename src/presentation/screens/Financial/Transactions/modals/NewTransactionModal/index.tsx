import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { AdaptiveLayout } from "@components";

import SplitForm from "../SplitForm";
import TransferForm from "../TransferForm";
import { useNewTransactionViewModel } from "./hooks";
import { Wide } from "./views";

interface FormProps {
  // Spec 098: picking "Transferência" in the type control swaps the form for the transfer form.
  onTransferType: () => void;
}

// The transfer and split forms are sibling bodies of the same modal: new transfers start from the type control, and a
// transfer row opens it directly (`transferId`); the split form opens for a split (`splitId`), from "Dividir"
// (`split`) or to turn a saved transaction into a split (`fromId`). The transaction form (and its many queries)
// mounts only when it is the one shown.
function NewTransactionModal() {
  const params = useLocalSearchParams<{
    fromId?: string;
    split?: string;
    splitId?: string;
    transferId?: string;
  }>();
  const [isTransfer, setTransfer] = useState(!!params.transferId);

  if (params.splitId || params.fromId || params.split) {
    return <SplitForm />;
  }

  return isTransfer ? (
    <TransferForm onSwitchType={() => setTransfer(false)} />
  ) : (
    <TransactionForm onTransferType={() => setTransfer(true)} />
  );
}

function TransactionForm({ onTransferType }: FormProps) {
  const vm = useNewTransactionViewModel();

  return <AdaptiveLayout vm={{ ...vm, onTransferType }} wide={Wide} />;
}

export default NewTransactionModal;
