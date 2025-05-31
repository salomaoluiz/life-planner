import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";
import FinancialCategoriesViewModel from "@screens/Financial/Categories/models/FinancialCategoriesViewModel";

function useCategoryList() {
  const { data, refetch } = useQuery<FinancialCategoriesViewModel>({
    cacheKey: [useCases.getFinancialCategoriesUseCase.uniqueName],
    fetch: async () => {
      const owners = await useCases.getOwnersUseCase.execute();
      const ownerIds = owners.map((owner) => owner.id);
      const dto = await useCases.getFinancialCategoriesUseCase.execute({
        ownerIds,
      });

      return new FinancialCategoriesViewModel(dto, owners);
    },
  });

  return {
    data,
    refetch,
  };
}

export default useCategoryList;
