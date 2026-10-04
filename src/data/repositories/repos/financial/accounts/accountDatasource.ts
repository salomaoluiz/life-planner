import AccountModel from "@data/models/financial/AccountModel";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export interface AccountDatasource {
  createAccount(params: CreateAccountDatasourceParams): Promise<AccountModel>;
  deleteAccount(params: DeleteAccountDatasourceParams): Promise<void>;
  getAccounts(ownerIds: string[]): Promise<AccountModel[]>;
  updateAccount(params: UpdateAccountDatasourceParams): Promise<void>;
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

interface UpdateAccountDatasourceParams {
  balance?: number;
  icon?: string;
  id: string;
  name?: string;
  owner?: OwnerType;
  ownerId?: string;
  status?: string;
}

export { CreateAccountDatasourceParams, UpdateAccountDatasourceParams };
