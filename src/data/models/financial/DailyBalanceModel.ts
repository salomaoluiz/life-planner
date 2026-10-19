import { OwnerType } from "./TransactionModel";

interface IDailyBalanceModel {
  accounts: {
    icon: string;
    id: string;
    name: string;
    owner: OwnerType;
    ownerId: string;
  }[];
  days: {
    accounts: { accountId: string; balanceCents: number }[];
    cardsDueCents: number;
    date: string;
    projected: boolean;
    totalCents: number;
  }[];
  month: string;
}

// API shape of `GET /v1/finance/accounts/daily-balances`; money stays in cents.
class DailyBalanceModel implements IDailyBalanceModel {
  accounts: IDailyBalanceModel["accounts"];
  days: IDailyBalanceModel["days"];
  month: string;

  constructor(params: IDailyBalanceModel) {
    this.accounts = params.accounts;
    this.days = params.days;
    this.month = params.month;
  }

  static fromJSON(data: Record<string, unknown>): DailyBalanceModel {
    const accounts = (data.accounts as Record<string, unknown>[]) ?? [];
    const days = (data.days as Record<string, unknown>[]) ?? [];

    return new DailyBalanceModel({
      accounts: accounts.map((account) => ({
        icon: account.icon as string,
        id: account.id as string,
        name: account.name as string,
        owner: account.owner as OwnerType,
        ownerId: account.ownerId as string,
      })),
      days: days.map((day) => ({
        accounts: ((day.accounts as Record<string, unknown>[]) ?? []).map(
          (item) => ({
            accountId: item.accountId as string,
            balanceCents: Number(item.balance),
          }),
        ),
        cardsDueCents: Number(day.cardsDue),
        date: day.date as string,
        projected: Boolean(day.projected),
        totalCents: Number(day.total),
      })),
      month: data.month as string,
    });
  }
}

export default DailyBalanceModel;
