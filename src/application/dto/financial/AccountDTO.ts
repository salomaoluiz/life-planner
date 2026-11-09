import AccountEntity, {
  AccountType,
  DEFAULT_ACCOUNT_TYPE,
} from "@domain/entities/financial/AccountEntity";
import {
  CurrencyCode,
  DEFAULT_CURRENCY,
} from "@domain/entities/financial/Currency";

export interface IAccountDTO {
  balance: number;
  currency?: CurrencyCode;
  icon: string;
  id: string;
  isFavorite?: boolean;
  name: string;
  owner: string;
  ownerId: string;
  projectedBalance?: number;
  status: string;
  type?: AccountType;
}

class AccountDTO {
  balance: number;
  currency: CurrencyCode;
  icon: string;
  id: string;
  isFavorite: boolean;
  name: string;
  owner: string;
  ownerId: string;
  projectedBalance: number;
  status: string;
  type: AccountType;

  constructor(params: IAccountDTO) {
    this.balance = params.balance;
    this.currency = params.currency ?? DEFAULT_CURRENCY;
    this.icon = params.icon;
    this.id = params.id;
    this.isFavorite = params.isFavorite ?? false;
    this.name = params.name;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.projectedBalance = params.projectedBalance ?? params.balance;
    this.status = params.status;
    this.type = params.type ?? DEFAULT_ACCOUNT_TYPE;
  }

  static fromEntity(entity: AccountEntity) {
    return new AccountDTO({
      balance: entity.balance,
      currency: entity.currency,
      icon: entity.icon,
      id: entity.id,
      isFavorite: entity.isFavorite,
      name: entity.name,
      owner: entity.owner,
      ownerId: entity.ownerId,
      projectedBalance: entity.projectedBalance,
      status: entity.status,
      type: entity.type,
    });
  }
}

export default AccountDTO;
