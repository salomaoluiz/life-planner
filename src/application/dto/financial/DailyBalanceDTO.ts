import DailyBalanceEntity, {
  DailyBalanceAccountEntity,
  DailyBalanceDayEntity,
} from "@domain/entities/financial/DailyBalanceEntity";

class DailyBalanceDTO {
  accounts: DailyBalanceAccountEntity[];
  days: DailyBalanceDayEntity[];
  month: string;

  constructor(params: {
    accounts: DailyBalanceAccountEntity[];
    days: DailyBalanceDayEntity[];
    month: string;
  }) {
    this.accounts = params.accounts;
    this.days = params.days;
    this.month = params.month;
  }

  static fromEntity(entity: DailyBalanceEntity): DailyBalanceDTO {
    return new DailyBalanceDTO({
      accounts: entity.accounts,
      days: entity.days,
      month: entity.month,
    });
  }
}

export default DailyBalanceDTO;
