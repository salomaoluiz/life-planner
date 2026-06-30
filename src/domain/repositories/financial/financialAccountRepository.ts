import AccountEntity from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export type FinancialAccountRepository = {
  createAccount(params: CreateAccountRepositoryParams): Promise<AccountEntity>;
  deleteAccount(params: DeleteAccountRepositoryParams): Promise<void>;
  getAccounts(ownerIds: string[]): Promise<AccountEntity[]>;
  updateAccount(params: UpdateAccountRepositoryParams): Promise<void>;
};

interface CreateAccountRepositoryParams {
  balance: number;
  icon: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  status: string;
}

interface DeleteAccountRepositoryParams {
  id: string;
  ownerId: string;
}

interface UpdateAccountRepositoryParams {
  balance?: number;
  icon?: string;
  id: string;
  name?: string;
  owner?: OwnerType;
  ownerId?: string;
  status?: string;
}

export { CreateAccountRepositoryParams, UpdateAccountRepositoryParams };
