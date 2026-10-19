import AccountEntity from "@domain/entities/financial/AccountEntity";
import DailyBalanceEntity from "@domain/entities/financial/DailyBalanceEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export type FinancialAccountRepository = {
  adjustAccountBalance(
    params: AdjustAccountBalanceRepositoryParams,
  ): Promise<void>;
  createAccount(params: CreateAccountRepositoryParams): Promise<AccountEntity>;
  deleteAccount(params: DeleteAccountRepositoryParams): Promise<void>;
  getAccounts(ownerIds: string[]): Promise<AccountEntity[]>;
  getDailyBalances(
    params: GetDailyBalancesRepositoryParams,
  ): Promise<DailyBalanceEntity>;
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

interface GetDailyBalancesRepositoryParams {
  // `YYYY-MM`
  month: string;
  ownerIds: string[];
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
  GetDailyBalancesRepositoryParams,
  UpdateAccountRepositoryParams,
};
