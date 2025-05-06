import StockDTO from "@application/dto/stock/StockDTO";
import StockEntity from "@domain/entities/stock/StockEntity";

export interface IStockDashboardDTO {
  stockDTOs: StockDTO[];
}

class StockDashboardDTO {
  stockDTOs: StockDTO[];

  constructor(params: IStockDashboardDTO) {
    this.stockDTOs = params.stockDTOs;
  }

  static fromEntity(stockEntity: StockEntity[]) {
    return new StockDashboardDTO({
      stockDTOs: stockEntity.map((stock) => StockDTO.fromEntity(stock)),
    });
  }
}

export default StockDashboardDTO;
