import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";
import { TranslationKeys } from "@presentation/i18n/types";
import { buildCategoryRows } from "@screens/Financial/models/categoryTree";
import {
  ALL_OWNERS,
  buildOwnerFilterChoices,
} from "@screens/Financial/models/ownerOptions";

import CategoryRowUIModel from "../models/CategoryRowUIModel";

interface CategoriesData {
  categories: CategoryDTO[];
  owners: OwnerDTO[];
}

const TYPE_OPTIONS: { labelKey: TranslationKeys; value: string }[] = [
  { labelKey: "financial.common.expense", value: "EXPENSE" },
  { labelKey: "financial.common.income", value: "INCOME" },
];

async function fetchCategories(): Promise<CategoriesData> {
  const owners = await useCases.getOwnersUseCase.execute();
  const categories = await useCases.getFinancialCategoriesUseCase.execute(
    owners.map((owner) => owner.id),
  );

  return { categories, owners };
}

function useCategoriesViewModel() {
  const isFocused = useIsFocused();
  const [type, setType] = useState("EXPENSE");
  const [ownerFilter, setOwnerFilter] = useState(ALL_OWNERS);

  const query = useQuery<CategoriesData>({
    cacheKey: [useCases.getFinancialCategoriesUseCase.uniqueName],
    fetch: fetchCategories,
  });

  useEffect(() => {
    if (isFocused) {
      query.refetch();
    }
  }, [isFocused]);

  const rows = useMemo(
    () =>
      buildCategoryRows(
        (query.data?.categories ?? []).filter(
          (category) =>
            category.type === type &&
            (ownerFilter === ALL_OWNERS || category.ownerId === ownerFilter),
        ),
      ).map((row) => new CategoryRowUIModel(row)),
    [query.data, type, ownerFilter],
  );

  let emptyTitleKey: TranslationKeys = "financial.categories.emptyIncome";
  if (type === "EXPENSE") {
    emptyTitleKey = "financial.categories.emptyExpense";
  }

  return {
    emptyTitleKey,
    errorMessage: query.error?.message,
    isEmpty: rows.length === 0,
    isLoading: query.isFetching && !query.data,
    isRefreshing: query.isFetching && !!query.data,
    onAddPress: () =>
      router.push("/financial/category/add_new_category" as never),
    onOwnerFilterChange: setOwnerFilter,
    onRefresh: async () => query.refetch(),
    onRetry: async () => query.refetch(),
    onRowPress: (id: string) =>
      router.push({
        params: { id },
        pathname: "/financial/category/add_new_category",
      } as never),
    onTypeChange: setType,
    ownerChoices: buildOwnerFilterChoices(query.data?.owners ?? []),
    ownerFilter,
    rows,
    type,
    typeOptions: TYPE_OPTIONS,
  };
}

export { fetchCategories };
export default useCategoriesViewModel;
