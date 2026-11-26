import StockMovementEntity, {
  DiscardValueSources,
  StockMovementReasons,
  StockMovementTypes,
} from "@domain/entities/stock/StockMovementEntity";

class StockMovementDTO {
  constructor(
    readonly id: string,
    readonly type: StockMovementTypes,
    readonly quantity: number,
    readonly lotId: string,
    readonly createdAt: Date,
    readonly reason?: StockMovementReasons,
    readonly note?: string,
    // `undefined` = a former member.
    readonly user?: { id: string; name: string },
    // Spec 123: the ENTRY price and the DISCARD value recorded at the time.
    readonly unitPriceCents?: number,
    readonly valueCents?: number,
    readonly currency?: string,
    readonly valueSource?: DiscardValueSources,
  ) {}

  static fromEntity(entity: StockMovementEntity) {
    return new StockMovementDTO(
      entity.id,
      entity.type,
      entity.quantity,
      entity.lotId,
      entity.createdAt,
      entity.reason,
      entity.note,
      entity.user,
      entity.unitPriceCents,
      entity.valueCents,
      entity.currency,
      entity.valueSource,
    );
  }
}

export default StockMovementDTO;
