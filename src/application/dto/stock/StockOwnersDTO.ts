import { StockOwners } from "@domain/entities/stock/StockEntity";

interface IStockOwnersDTO {
  id: string;
  name: string;
  type: StockOwners;
}

class StockOwnersDTO {
  id: string;
  name: string;
  type: StockOwners;

  constructor(params: IStockOwnersDTO) {
    this.id = params.id;
    this.name = params.name;
    this.type = params.type;
  }
}

export default StockOwnersDTO;
