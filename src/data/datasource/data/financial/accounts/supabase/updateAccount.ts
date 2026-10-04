import { AccountDatasource } from "@data/repositories/repos/financial/accounts/accountDatasource";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<AccountDatasource["updateAccount"]>[0];

async function updateAccount(params: Params): Promise<void> {
  try {
    const { id, ownerId, ...updateParams } = params;
    const query = supabase
      .from("financial_accounts")
      .update(updateParams)
      .eq("id", id);

    if (ownerId) {
      query.eq("owner_id", ownerId);
    }

    const response = await query.then();

    if (response.error) {
      throw response.error;
    }
  } catch (error) {
    if (error instanceof BusinessError) {
      throw error;
    }
    const genericError = new GenericError();
    genericError.addContext({
      datasource: "AccountDatasource - updateAccount",
      error,
      params,
    });
    throw genericError;
  }
}

export default updateAccount;
