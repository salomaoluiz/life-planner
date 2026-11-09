import {
  CurrencyCode,
  DEFAULT_CURRENCY,
} from "@domain/entities/financial/Currency";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

// Spec 101: every type behaves like an account; it only groups and labels.
export enum AccountType {
  BROKERAGE = "BROKERAGE",
  CASH = "CASH",
  CHECKING = "CHECKING",
  OTHER = "OTHER",
  SAVINGS = "SAVINGS",
}

export const DEFAULT_ACCOUNT_TYPE = AccountType.CHECKING;

interface IAccountEntity {
  balance: number;
  currency?: CurrencyCode;
  icon: string;
  id: string;
  // Spec 094: the favorite account of the signed-in user (one at most).
  isFavorite?: boolean;
  name: string;
  owner: OwnerType;
  ownerId: string;
  projectedBalance?: number;
  status: AccountStatus;
  type?: AccountType;
}

class AccountEntity implements IAccountEntity {
  balance: number;
  currency: CurrencyCode;
  icon: string;
  id: string;
  isFavorite: boolean;
  name: string;
  owner: OwnerType;
  ownerId: string;
  // Balance at the end of the current month: equals `balance` when nothing is scheduled later this month.
  projectedBalance: number;
  status: AccountStatus;
  type: AccountType;

  constructor(params: IAccountEntity) {
    this.currency = params.currency ?? DEFAULT_CURRENCY;
    this.id = params.id;
    this.balance = params.balance;
    this.icon = params.icon;
    this.isFavorite = params.isFavorite ?? false;
    this.name = params.name;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.projectedBalance = params.projectedBalance ?? params.balance;
    this.status = params.status;
    this.type = params.type ?? DEFAULT_ACCOUNT_TYPE;
  }
}

// An old API answers no type: anything unknown reads as the default.
export function toAccountType(value: unknown): AccountType {
  return (
    Object.values(AccountType).find((type) => type === value) ??
    DEFAULT_ACCOUNT_TYPE
  );
}

export default AccountEntity;
