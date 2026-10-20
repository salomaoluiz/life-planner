import {
  CurrencyCode,
  DEFAULT_CURRENCY,
} from "@domain/entities/financial/Currency";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

interface IAccountEntity {
  balance: number;
  currency?: CurrencyCode;
  icon: string;
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  projectedBalance?: number;
  status: AccountStatus;
}

class AccountEntity implements IAccountEntity {
  balance: number;
  currency: CurrencyCode;
  icon: string;
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  // Balance at the end of the current month: equals `balance` when nothing is scheduled later this month.
  projectedBalance: number;
  status: AccountStatus;

  constructor(params: IAccountEntity) {
    this.currency = params.currency ?? DEFAULT_CURRENCY;
    this.id = params.id;
    this.balance = params.balance;
    this.icon = params.icon;
    this.name = params.name;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.projectedBalance = params.projectedBalance ?? params.balance;
    this.status = params.status;
  }
}

export default AccountEntity;
