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
    readonly unitPriceCents?: number,
    readonly currency?: string,
    readonly leftoverQuantity?: number,
    readonly leftoverDismissed: boolean = false,
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
      typeof data.unitPriceCents === "number" ? data.unitPriceCents : undefined,
      typeof data.currency === "string" ? data.currency : undefined,
      typeof data.leftoverQuantity === "number"
        ? data.leftoverQuantity
        : undefined,
      data.leftoverDismissed === true,
    );
  }
}

export default StockLotModel;
