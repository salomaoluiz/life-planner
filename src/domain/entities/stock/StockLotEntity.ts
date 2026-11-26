export enum StockLotStatus {
  EXPIRED = "EXPIRED",
  EXPIRING = "EXPIRING",
  NONE = "NONE",
  OK = "OK",
}

interface IStockLotEntity {
  currency?: string;
  effectiveExpiration?: Date;
  expirationDate?: Date;
  expirationStatus: StockLotStatus;
  id: string;
  leftoverDismissed?: boolean;
  leftoverQuantity?: number;
  openedAt?: Date;
  purchaseDate?: Date;
  quantity: number;
  unitPriceCents?: number;
}

class StockLotEntity {
  currency?: string;
  effectiveExpiration?: Date;
  expirationDate?: Date;
  expirationStatus: StockLotStatus;
  id: string;
  leftoverDismissed: boolean;
  leftoverQuantity?: number;
  openedAt?: Date;
  purchaseDate?: Date;
  quantity: number;
  unitPriceCents?: number;

  constructor(params: IStockLotEntity) {
    this.currency = params.currency;
    this.effectiveExpiration = params.effectiveExpiration;
    this.expirationDate = params.expirationDate;
    this.expirationStatus = params.expirationStatus;
    this.id = params.id;
    this.leftoverDismissed = params.leftoverDismissed ?? false;
    this.leftoverQuantity = params.leftoverQuantity;
    this.openedAt = params.openedAt;
    this.purchaseDate = params.purchaseDate;
    this.quantity = params.quantity;
    this.unitPriceCents = params.unitPriceCents;
  }
}

export default StockLotEntity;
