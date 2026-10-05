import { useEffect } from "react";
import { Alert } from "react-native";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";
import useTranslation from "@presentation/i18n/useTranslation";
import useFinancialErrorFeedback from "@screens/Financial/hooks/useFinancialErrorFeedback";
import { isWeb } from "@utils/platform";

import FinancialCategoryViewModel from "../../../models/FinancialCategoryViewModel";

export interface Props {
  item: FinancialCategoryViewModel;
  refetch: () => void;
}

function useListItem(props: Props) {
  const { t } = useTranslation();
  const deleteItem = useMutation({
    cacheKey: [useCases.deleteFinancialCategoryUseCase.uniqueName],
    fetch: useCases.deleteFinancialCategoryUseCase.execute,
  });

  useFinancialErrorFeedback(deleteItem.error);

  useEffect(() => {
    if (deleteItem.status === "success") {
      props.refetch();
    }
  }, [deleteItem.status]);

  function deleteCategory() {
    deleteItem.mutate({
      id: props.item.id,
      ownerId: props.item.ownerId,
    });
  }

  async function onDelete() {
    // Deleting a category also deletes its subcategories: confirm only in that case.
    if (!props.item.hasSubcategories) {
      deleteCategory();
      return;
    }

    const title = t("financial.categories.deleteAlertTitle");
    const message = `${t("financial.categories.deleteAlertMsg")} ${t("financial.categories.deleteConfirm.withSubcategories")}`;

    if (isWeb()) {
      if (window.confirm(`${title}\n\n${message}`)) {
        deleteCategory();
      }
      return;
    }

    Alert.alert(title, message, [
      {
        style: "cancel",
        text: t("financial.categories.cancel"),
      },
      {
        onPress: deleteCategory,
        style: "destructive",
        text: t("financial.categories.deleteBtn"),
      },
    ]);
  }

  return { onDelete };
}

export default useListItem;
