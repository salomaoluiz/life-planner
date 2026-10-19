import { OwnerType } from "@domain/entities/user/OwnerEntity";

// Money in cents; dates `YYYY-MM-DD` (spec 035).
export interface DailyBalanceAccountEntity {
  icon: string;
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
}

export interface DailyBalanceDayEntity {
  accounts: { accountId: string; balanceCents: number }[];
  cardsDueCents: number;
  date: string;
  projected: boolean;
  totalCents: number;
}

interface IDailyBalanceEntity {
  accounts: DailyBalanceAccountEntity[];
  days: DailyBalanceDayEntity[];
  month: string;
}

class DailyBalanceEntity implements IDailyBalanceEntity {
  accounts: DailyBalanceAccountEntity[];
  days: DailyBalanceDayEntity[];
  month: string;

  constructor(params: IDailyBalanceEntity) {
    this.accounts = params.accounts;
    this.days = params.days;
    this.month = params.month;
  }
}

export default DailyBalanceEntity;
