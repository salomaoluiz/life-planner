import { StockBarcodeLookupDTO } from "@application/dto/stock/StockBarcodeDTO";
import StockDTO from "@application/dto/stock/StockDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type LookupStockBarcodeUseCaseParams = { code: string };

// Spec 121 FR 8: the items that hold a scanned or typed code in every owner the user can read.
function lookupStockBarcodeUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  LookupStockBarcodeUseCaseParams,
  StockBarcodeLookupDTO
> {
  return {
    execute: async (params: LookupStockBarcodeUseCaseParams) => {
      try {
        const lookup = await repositories.stockRepository.lookupStockBarcode(
          params.code,
        );

        return {
          code: lookup.code,
          matches: lookup.matches.map((match) => ({
            ...match,
            item: StockDTO.fromEntity(match.item),
          })),
        };
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "lookupStockBarcodeUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.lookup_stock_barcode_use_case",
  };
}

export default lookupStockBarcodeUseCase;
