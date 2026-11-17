export enum StockLotStatus {
  EXPIRED = "EXPIRED",
  EXPIRING = "EXPIRING",
  NONE = "NONE",
  OK = "OK",
}

interface IStockLotEntity {
  effectiveExpiration?: Date;
  expirationDate?: Date;
  expirationStatus: StockLotStatus;
  id: string;
  openedAt?: Date;
  purchaseDate?: Date;
  quantity: number;
}

class StockLotEntity {
  effectiveExpiration?: Date;
  expirationDate?: Date;
  expirationStatus: StockLotStatus;
  id: string;
  openedAt?: Date;
  purchaseDate?: Date;
  quantity: number;

  constructor(params: IStockLotEntity) {
    this.effectiveExpiration = params.effectiveExpiration;
    this.expirationDate = params.expirationDate;
    this.expirationStatus = params.expirationStatus;
    this.id = params.id;
    this.openedAt = params.openedAt;
    this.purchaseDate = params.purchaseDate;
    this.quantity = params.quantity;
  }
}

export default StockLotEntity;
