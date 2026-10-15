import AccountEntity from "@domain/entities/financial/AccountEntity";

export interface IAccountDTO {
  balance: number;
  icon: string;
  id: string;
  name: string;
  owner: string;
  ownerId: string;
  projectedBalance?: number;
  status: string;
}

class AccountDTO {
  balance: number;
  icon: string;
  id: string;
  name: string;
  owner: string;
  ownerId: string;
  projectedBalance: number;
  status: string;

  constructor(params: IAccountDTO) {
    this.balance = params.balance;
    this.icon = params.icon;
    this.id = params.id;
    this.name = params.name;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.projectedBalance = params.projectedBalance ?? params.balance;
    this.status = params.status;
  }

  static fromEntity(entity: AccountEntity) {
    return new AccountDTO({
      balance: entity.balance,
      icon: entity.icon,
      id: entity.id,
      name: entity.name,
      owner: entity.owner,
      ownerId: entity.ownerId,
      projectedBalance: entity.projectedBalance,
      status: entity.status,
    });
  }
}

export default AccountDTO;
