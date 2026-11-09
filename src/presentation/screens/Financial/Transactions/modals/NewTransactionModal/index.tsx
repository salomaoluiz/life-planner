import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { AdaptiveLayout } from "@components";

import TransferForm from "../TransferForm";
import { useNewTransactionViewModel } from "./hooks";
import { Wide } from "./views";

interface FormProps {
  // Spec 098: picking "Transferência" in the type control swaps the form for the transfer form.
  onTransferType: () => void;
}

// The transfer form is a sibling body of the same modal: new transfers start from the type control, and a transfer row
// opens it directly (`transferId`). The transaction form (and its many queries) mounts only when it is the one shown.
function NewTransactionModal() {
  const params = useLocalSearchParams<{ transferId?: string }>();
  const [isTransfer, setTransfer] = useState(!!params.transferId);

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
