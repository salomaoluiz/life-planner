import AccountModel from "@data/models/financial/AccountModel";
import { AccountDatasource } from "@data/repositories/repos/financial/accounts/accountDatasource";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<AccountDatasource["createAccount"]>[0];

async function createAccount(params: Params): Promise<AccountModel> {
  try {
    const response = await supabase
      .from("financial_accounts")
      .upsert({
        balance: params.balance,
        icon: params.icon,
        name: params.name,
        owner: params.owner,
        owner_id: params.ownerId,
        status: params.status,
      })
      .select()
      .then();

    if (response.error) {
      throw response.error;
    }

    if (!response.data) {
      throw new Error("Without data response");
    }

    return AccountModel.fromJSON(response.data[0]);
  } catch (error) {
    if (error instanceof BusinessError) {
      throw error;
    }
    const genericError = new GenericError();
    genericError.addContext({
      datasource: "AccountDatasource - createAccount",
      error,
      params,
    });
    throw genericError;
  }
}

export default createAccount;
