import { useEffect, useState } from "react";

import { useCases } from "@application/useCases";
import { DeleteCategoryUseCaseParams } from "@application/useCases/cases/financial/categories/deleteCategoryUseCase";
import { useMutation } from "@infrastructure/fetcher";
import CategoryViewModel from "@screens/Financial/Categories/models/CategoryViewModel";

export interface Props {
  category: CategoryViewModel;
  refetch: () => void;
}

function useCategoryItem(props: Props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const { category, refetch } = props;
  const { isFetching, mutate, status } = useMutation<
    DeleteCategoryUseCaseParams,
    void
  >({
    cacheKey: [useCases.deleteFinancialCategoryUseCase.uniqueName],
    fetch: useCases.deleteFinancialCategoryUseCase.execute,
  });

  useEffect(() => {
    if (status === "success") {
      refetch();
    }
  }, [status]);

  async function onDelete() {
    mutate({
      id: category.id,
      ownerId: category.ownerId,
    });
    refetch();
    setMenuVisible(false);
  }

  function onEdit() {}

  function onMenuPress() {
    setMenuVisible(!menuVisible);
  }

  return {
    isFetching,
    menuVisible,
    onDelete,
    onEdit,
    onMenuPress,
  };
}

export default useCategoryItem;
