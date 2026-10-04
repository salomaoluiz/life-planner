import { AccountDatasource } from "@data/repositories/repos/financial/accounts/accountDatasource";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<AccountDatasource["deleteAccount"]>[0];

async function deleteAccount(params: Params): Promise<void> {
  try {
    const response = await supabase
      .from("financial_accounts")
      .delete()
      .eq("id", params.id)
      .eq("owner_id", params.ownerId)
      .then();

    if (response.error) {
      throw response.error;
    }
  } catch (error) {
    if (error instanceof BusinessError) {
      throw error;
    }
    const genericError = new GenericError();
    genericError.addContext({
      datasource: "AccountDatasource - deleteAccount",
      error,
      params,
    });
    throw genericError;
  }
}

export default deleteAccount;
