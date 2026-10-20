import { useState } from "react";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { isArchivedOwner } from "@screens/Financial/models/ownerOptions";

// Spec 042 FR 7: an archived family selected in the owner filter is read-only. `guard` wraps the actions that
// would create / open a form: they show the read-only toast instead.
function useReadOnlyScope(owners: OwnerDTO[] | undefined, ownerFilter: string) {
  const [toastVisible, setToastVisible] = useState(false);
  const readOnly = !!owners && isArchivedOwner(owners, ownerFilter);

  function notifyReadOnly() {
    setToastVisible(true);
  }

  function guard<Args extends unknown[]>(action: (...args: Args) => void) {
    return (...args: Args) => {
      if (readOnly) {
        notifyReadOnly();
        return;
      }

      action(...args);
    };
  }

  return {
    guard,
    notifyReadOnly,
    onToastHide: () => setToastVisible(false),
    readOnly,
    toastVisible,
  };
}

export default useReadOnlyScope;
