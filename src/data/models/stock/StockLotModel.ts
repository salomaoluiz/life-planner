import { optionalDay } from "@domain/entities/stock/stockDay";

class StockLotModel {
  constructor(
    readonly id: string,
    readonly quantity: number,
    readonly expirationStatus: string,
    readonly effectiveExpiration?: Date,
    readonly expirationDate?: Date,
    readonly openedAt?: Date,
    readonly purchaseDate?: Date,
  ) {}

  static fromJSON(data: Record<string, unknown>): StockLotModel {
    return new StockLotModel(
      data.id as string,
      data.quantity as number,
      data.expirationStatus as string,
      optionalDay(data.effectiveExpiration),
      optionalDay(data.expirationDate),
      optionalDay(data.openedAt),
      optionalDay(data.purchaseDate),
    );
  }
}

export default StockLotModel;
