import StockDTO from "@application/dto/stock/StockDTO";

export enum StockAttentionStatus {
  EXPIRED = "EXPIRED",
  EXPIRING = "EXPIRING",
}

export interface IStockAttentionDTO {
  attentionCount: number;
  items: IStockAttentionItemDTO[];
  totalItems: number;
}

export interface IStockAttentionItemDTO {
  // < 0 expired, 0 today, 1 tomorrow, n days left (local calendar days).
  daysLeft: number;
  status: StockAttentionStatus;
  stock: StockDTO;
}

class StockAttentionDTO implements IStockAttentionDTO {
  attentionCount: number;
  items: IStockAttentionItemDTO[];
  totalItems: number;

  constructor(params: IStockAttentionDTO) {
    this.attentionCount = params.attentionCount;
    this.items = params.items;
    this.totalItems = params.totalItems;
  }
}

export default StockAttentionDTO;
