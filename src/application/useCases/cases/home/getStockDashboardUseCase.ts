import StockDashboardDTO from "@application/dto/home/StockDashboardDTO";
import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function getStockDashboardUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<StockDashboardDTO> {
  return {
    execute: async () => {
      try {
        const user = await repositories.userRepository.getUser();
        const families = await repositories.familyRepository.getFamilies(
          user.id,
        );

        const ownerIds = families.map((family) => family.id);
        ownerIds.push(user.id);

        const promises = ownerIds.map(async (ownerId) =>
          repositories.stockRepository.getStockItems(ownerId),
        );

        const entities = await Promise.all(promises);

        return StockDashboardDTO.fromEntity(entities.flat());
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "getStockDashboardUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_stock_dashboard_use_case",
  };
}

export default getStockDashboardUseCase;
