import useStableCallback from "@presentation/hooks/useStableCallback";
import { setPayRequest } from "@screens/Financial/ConfirmPayment/models/payRequest";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import TransactionUIModel from "../models/TransactionUIModel";

// Spec 097: the ✓ on an unpaid account row opens the confirmation modal (value and date). Nothing is saved until the
// user confirms there; the confirmed payment then goes through the 061 pending queue. There is no unpay action here,
// only the form can turn the status off (spec 033 FR 18).
function usePayTransaction() {
  const { openModal } = useModalNavigation();

  // A stable identity: the memoized rows do not render again when the screen does.
  const openFor = useStableCallback((item: TransactionUIModel) => {
    setPayRequest({ item: item.dto });
    openModal("confirm_payment");
  });

  return { openFor };
}

export default usePayTransaction;
