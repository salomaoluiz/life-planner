import { router } from "expo-router";

import { useTranslation } from "@presentation/i18n";
import {
  STOCK_ITEM_ADD_PATH,
  TRANSACTION_ADD_PATH,
} from "@screens/Navigation/models/navigationItems";

function useQuickAddViewModel() {
  const { t } = useTranslation();

  function onClose() {
    router.back();
  }

  function openForm(path: string) {
    // The form takes the place of the sheet in the stack: closing it returns to the tab.
    router.replace(path as never);
  }

  return {
    closeLabel: t("common.actions.close"),
    onClose,
    options: [
      {
        icon: "swap-vertical",
        onPress: () => openForm(TRANSACTION_ADD_PATH),
        testID: "quick-add-transaction",
        title: t("navigation.quickAdd.transaction"),
      },
      {
        icon: "package-variant-closed",
        onPress: () => openForm(STOCK_ITEM_ADD_PATH),
        testID: "quick-add-stock-item",
        title: t("navigation.quickAdd.stockItem"),
      },
    ],
    title: t("navigation.quickAdd.title"),
  };
}

export default useQuickAddViewModel;
