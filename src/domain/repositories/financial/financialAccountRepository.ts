import AccountEntity from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export type FinancialAccountRepository = {
  adjustAccountBalance(
    params: AdjustAccountBalanceRepositoryParams,
  ): Promise<void>;
  createAccount(params: CreateAccountRepositoryParams): Promise<AccountEntity>;
  deleteAccount(params: DeleteAccountRepositoryParams): Promise<void>;
  getAccounts(ownerIds: string[]): Promise<AccountEntity[]>;
  updateAccount(params: UpdateAccountRepositoryParams): Promise<void>;
};

interface AdjustAccountBalanceRepositoryParams {
  balance: number;
  id: string;
}

interface CreateAccountRepositoryParams {
  // The initial balance of the new account.
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
  icon?: string;
  id: string;
  name?: string;
  owner?: OwnerType;
  ownerId?: string;
  status?: string;
}

export {
  AdjustAccountBalanceRepositoryParams,
  CreateAccountRepositoryParams,
  UpdateAccountRepositoryParams,
};
