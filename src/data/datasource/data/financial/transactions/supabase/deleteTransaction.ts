import { TransactionDatasource } from "@data/repositories/repos/financial/transactions/transactionDatasource";
import { GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<TransactionDatasource["deleteTransaction"]>[0];

async function deleteTransaction(params: Params) {
  try {
    await supabase
      .from("financial_transactions")
      .delete()
      .eq("id", params.id)
      .eq("owner_id", params.ownerId)
      .then();
  } catch (error) {
    const genericError = new GenericError();
    genericError.addContext({
      datasource: "TransactionDatasource - deleteTransaction",
      error,
      params,
    });
    throw genericError;
  }
}

export default deleteTransaction;
