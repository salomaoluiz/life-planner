export enum StockMovementReasons {
  EXPIRED = "EXPIRED",
  MANUAL = "MANUAL",
  OTHER = "OTHER",
  PURCHASE = "PURCHASE",
  SPOILED = "SPOILED",
}

export enum StockMovementTypes {
  ADJUST = "ADJUST",
  CONSUME = "CONSUME",
  DISCARD = "DISCARD",
  ENTRY = "ENTRY",
  INITIAL = "INITIAL",
  OPEN = "OPEN",
}

interface IStockMovementEntity {
  createdAt: Date;
  id: string;
  lotId: string;
  note?: string;
  quantity: number;
  reason?: StockMovementReasons;
  type: StockMovementTypes;
  // `undefined` = a former member ("Ex-membro").
  user?: { id: string; name: string };
}

class StockMovementEntity {
  createdAt: Date;
  id: string;
  lotId: string;
  note?: string;
  quantity: number;
  reason?: StockMovementReasons;
  type: StockMovementTypes;
  user?: { id: string; name: string };

  constructor(params: IStockMovementEntity) {
    this.createdAt = params.createdAt;
    this.id = params.id;
    this.lotId = params.lotId;
    this.note = params.note;
    this.quantity = params.quantity;
    this.reason = params.reason;
    this.type = params.type;
    this.user = params.user;
  }
}

export default StockMovementEntity;
