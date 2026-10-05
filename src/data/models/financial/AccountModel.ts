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
  status: AccountStatus;
}

class AccountModel implements IAccountModel {
  balance: number;
  icon: string;
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  status: AccountStatus;

  constructor(params: IAccountModel) {
    this.id = params.id;
    this.balance = params.balance;
    this.icon = params.icon;
    this.name = params.name;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.status = params.status;
  }

  static fromJSON(data: Record<string, unknown>): AccountModel {
    return new AccountModel({
      balance: centsToDecimal(Number(data.balance)),
      icon: data.icon as string,
      id: data.id as string,
      name: data.name as string,
      owner: data.owner as OwnerType,
      ownerId: data.ownerId as string,
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
      status: this.status,
    };
  }
}

export default AccountModel;
