import StockOwnersDTO from "@application/dto/stock/StockOwnersDTO";
import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { StockOwners } from "@domain/entities/stock/StockEntity";
import Repositories from "@domain/repositories";

function getStockOwnersUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<StockOwnersDTO[]> {
  return {
    execute: async () => {
      try {
        const user = await repositories.userRepository.getUser();
        const families = await repositories.familyRepository.getFamilies(
          user.id,
        );

        const ownerIds = families.map((family) => ({
          id: family.id,
          name: family.name,
          type: StockOwners.FAMILY,
        }));

        ownerIds.push({ id: user.id, name: user.name, type: StockOwners.USER });

        return ownerIds.map((owner) => new StockOwnersDTO(owner));
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "getStockOwnersUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_stock_owners_use_case",
  };
}

export default getStockOwnersUseCase;
