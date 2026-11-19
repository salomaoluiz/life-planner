import { useState } from "react";

import { useCases } from "@application/useCases";
import useStableCallback from "@presentation/hooks/useStableCallback";
import { TranslationKeys } from "@presentation/i18n/types";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import { invalidateAfterWrite } from "../pending/writeCache";

// Spec 119 FR 39: the expanded split line, "Editar" (the form of the whole group) and "Excluir grupo" (confirmed).
function useSplitRows() {
  const { openModal } = useModalNavigation();
  const [expandedId, setExpandedId] = useState<string>();
  const [deletingId, setDeletingId] = useState<string>();
  const [isDeleting, setDeleting] = useState(false);
  const [errorKey, setErrorKey] = useState<TranslationKeys>();

  const onToggle = useStableCallback((id: string) =>
    setExpandedId((current) => (current === id ? undefined : id)),
  );
  const onEdit = useStableCallback((id: string) =>
    openModal("add_new_transaction", { splitId: id }),
  );
  const onDelete = useStableCallback((id: string) => {
    setErrorKey(undefined);
    setDeletingId(id);
  });

  async function onDeleteConfirm() {
    if (!deletingId) {
      return;
    }
    setDeleting(true);
    try {
      await useCases.deleteFinancialSplitUseCase.execute(deletingId);
      setDeletingId(undefined);
      await invalidateAfterWrite({
        invoiceMonths: "all",
        listMonths: "all",
        projections: true,
      });
    } catch (error) {
      setErrorKey(
        getFinancialErrorMessageKey(error) ?? "common.errors.generic",
      );
    } finally {
      setDeleting(false);
    }
  }

  return {
    deleteErrorKey: errorKey,
    expandedId,
    isDeleteOpen: !!deletingId,
    isDeleting,
    onDelete,
    onDeleteCancel: () => setDeletingId(undefined),
    onDeleteConfirm,
    onEdit,
    onToggle,
  };
}

export default useSplitRows;
