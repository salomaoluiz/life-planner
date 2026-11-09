import { AdaptiveLayout } from "@components";

import { useConfirmPaymentViewModel } from "./hooks";
import { getPayRequest } from "./models/payRequest";
import ConfirmTransferModal from "./transfer";
import { Wide } from "./views";

// Spec 097: confirms ("Efetivar" / "Receber") an unpaid account row from the list.
function ConfirmPaymentForm() {
  const vm = useConfirmPaymentViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

// Spec 098 FR 7: the ✓ of a transfer row opens this same modal; a transfer is confirmed by its own body.
function ConfirmPaymentModal() {
  return getPayRequest()?.item.transferId ? (
    <ConfirmTransferModal />
  ) : (
    <ConfirmPaymentForm />
  );
}

export { ConfirmPaymentModal };
export default ConfirmPaymentModal;
