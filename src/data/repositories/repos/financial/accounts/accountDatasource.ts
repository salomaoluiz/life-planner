import AccountModel from "@data/models/financial/AccountModel";
import DailyBalanceModel from "@data/models/financial/DailyBalanceModel";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export interface AccountDatasource {
  adjustAccountBalance(
    params: AdjustAccountBalanceDatasourceParams,
  ): Promise<void>;
  createAccount(params: CreateAccountDatasourceParams): Promise<AccountModel>;
  deleteAccount(params: DeleteAccountDatasourceParams): Promise<void>;
  getAccounts(ownerIds: string[]): Promise<AccountModel[]>;
  getDailyBalances(
    params: GetDailyBalancesDatasourceParams,
  ): Promise<DailyBalanceModel>;
  updateAccount(params: UpdateAccountDatasourceParams): Promise<void>;
}

interface AdjustAccountBalanceDatasourceParams {
  // The balance the user wants to see today (decimal), not a difference.
  balance: number;
  id: string;
}

interface CreateAccountDatasourceParams {
  balance: number;
  icon: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  status: string;
}

interface DeleteAccountDatasourceParams {
  id: string;
  ownerId: string;
}

interface GetDailyBalancesDatasourceParams {
  month: string;
  ownerIds: string[];
}
interface UpdateAccountDatasourceParams {
  icon?: string;
  id: string;
  name?: string;
  owner?: OwnerType;
  ownerId?: string;
  status?: string;
}

export {
  AdjustAccountBalanceDatasourceParams,
  CreateAccountDatasourceParams,
  GetDailyBalancesDatasourceParams,
  UpdateAccountDatasourceParams,
};
