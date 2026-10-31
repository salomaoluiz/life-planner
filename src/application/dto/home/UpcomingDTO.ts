import {
  UpcomingEntity,
  UpcomingItemEntity,
} from "@domain/entities/financial/UpcomingEntity";

export type UpcomingItemDTO = UpcomingItemEntity;

class UpcomingDTO {
  next: UpcomingItemDTO[];
  nextTotal: number;
  overdue: UpcomingItemDTO[];
  overdueExpenseCents: number;

  constructor(params: {
    next: UpcomingItemDTO[];
    nextTotal: number;
    overdue: UpcomingItemDTO[];
    overdueExpenseCents: number;
  }) {
    this.next = params.next;
    this.nextTotal = params.nextTotal;
    this.overdue = params.overdue;
    this.overdueExpenseCents = params.overdueExpenseCents;
  }

  static fromEntity(entity: UpcomingEntity): UpcomingDTO {
    return new UpcomingDTO({
      next: entity.next,
      nextTotal: entity.nextTotal,
      overdue: entity.overdue,
      overdueExpenseCents: entity.overdueTotals.expenseCents,
    });
  }
}

export default UpcomingDTO;
