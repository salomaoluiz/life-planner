import AccountModel from "@data/models/financial/AccountModel";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

async function getAccounts(ownerIds: string[]): Promise<AccountModel[]> {
  try {
    const response = await supabase
      .from("financial_accounts")
      .select()
      .in("owner_id", ownerIds)
      .then();

    if (response.error) {
      throw response.error;
    }

    if (!response.data) {
      return [];
    }

    return response.data.map((item) => AccountModel.fromJSON(item));
  } catch (error) {
    if (error instanceof BusinessError) {
      throw error;
    }
    const genericError = new GenericError();
    genericError.addContext({
      datasource: "AccountDatasource - getAccounts",
      error,
      ownerIds,
    });
    throw genericError;
  }
}

export default getAccounts;
