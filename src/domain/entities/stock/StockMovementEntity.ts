// Spec 123 FR 27: where the value of a discard came from.
export enum DiscardValueSources {
  ITEM_LAST = "ITEM_LAST",
  LOT = "LOT",
  NONE = "NONE",
}

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
  currency?: string;
  id: string;
  lotId: string;
  note?: string;
  quantity: number;
  reason?: StockMovementReasons;
  type: StockMovementTypes;
  unitPriceCents?: number;
  // `undefined` = a former member ("Ex-membro").
  user?: { id: string; name: string };
  valueCents?: number;
  valueSource?: DiscardValueSources;
}

class StockMovementEntity {
  createdAt: Date;
  currency?: string;
  id: string;
  lotId: string;
  note?: string;
  quantity: number;
  reason?: StockMovementReasons;
  type: StockMovementTypes;
  unitPriceCents?: number;
  user?: { id: string; name: string };
  valueCents?: number;
  valueSource?: DiscardValueSources;

  constructor(params: IStockMovementEntity) {
    this.createdAt = params.createdAt;
    this.currency = params.currency;
    this.id = params.id;
    this.lotId = params.lotId;
    this.note = params.note;
    this.quantity = params.quantity;
    this.reason = params.reason;
    this.type = params.type;
    this.unitPriceCents = params.unitPriceCents;
    this.user = params.user;
    this.valueCents = params.valueCents;
    this.valueSource = params.valueSource;
  }
}

export default StockMovementEntity;
