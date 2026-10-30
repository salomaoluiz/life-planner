import { useTranslation } from "@presentation/i18n";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

function useQuickAddViewModel() {
  const { t } = useTranslation();
  const { closeModal, replaceModal } = useModalNavigation();

  return {
    closeLabel: t("common.actions.close"),
    // The form takes the place of the sheet in the stack: closing it returns to the screen below.
    onClose: closeModal,
    options: [
      {
        icon: "swap-vertical",
        onPress: () => replaceModal("add_new_transaction"),
        testID: "quick-add-transaction",
        title: t("navigation.quickAdd.transaction"),
      },
      {
        icon: "package-variant-closed",
        onPress: () => replaceModal("add_new_stock_item"),
        testID: "quick-add-stock-item",
        title: t("navigation.quickAdd.stockItem"),
      },
    ],
    title: t("navigation.quickAdd.title"),
  };
}

export default useQuickAddViewModel;
