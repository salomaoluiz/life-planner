import { AccountStatus } from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import { centsToDecimal, decimalToCents } from "./money";

interface IAccountModel {
  balance: number;
  icon: string;
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  projectedBalance?: number;
  status: AccountStatus;
}

class AccountModel implements IAccountModel {
  balance: number;
  icon: string;
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  projectedBalance: number;
  status: AccountStatus;

  constructor(params: IAccountModel) {
    this.id = params.id;
    this.balance = params.balance;
    this.icon = params.icon;
    this.name = params.name;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.projectedBalance = params.projectedBalance ?? params.balance;
    this.status = params.status;
  }

  static fromJSON(data: Record<string, unknown>): AccountModel {
    const balance = centsToDecimal(Number(data.balance));

    return new AccountModel({
      balance,
      icon: data.icon as string,
      id: data.id as string,
      name: data.name as string,
      owner: data.owner as OwnerType,
      ownerId: data.ownerId as string,
      projectedBalance:
        data.projectedBalance === undefined || data.projectedBalance === null
          ? balance
          : centsToDecimal(Number(data.projectedBalance)),
      status: data.status as AccountStatus,
    });
  }

  // Same shape as the API: also what the repository cache stores.
  toJSON() {
    return {
      balance: decimalToCents(this.balance),
      icon: this.icon,
      id: this.id,
      name: this.name,
      owner: this.owner,
      ownerId: this.ownerId,
      projectedBalance: decimalToCents(this.projectedBalance),
      status: this.status,
    };
  }
}

export default AccountModel;
