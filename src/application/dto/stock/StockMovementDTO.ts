import StockMovementEntity, {
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
    );
  }
}

export default StockMovementDTO;
