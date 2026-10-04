import { OwnerType } from "@domain/entities/user/OwnerEntity";

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

interface IAccountEntity {
  balance: number;
  icon: string;
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  status: AccountStatus;
}

class AccountEntity implements IAccountEntity {
  balance: number;
  icon: string;
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  status: AccountStatus;

  constructor(params: IAccountEntity) {
    this.id = params.id;
    this.balance = params.balance;
    this.icon = params.icon;
    this.name = params.name;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.status = params.status;
  }
}

export default AccountEntity;
