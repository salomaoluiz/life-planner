import { TransactionDatasource } from "@data/repositories/repos/financial/transactionDatasource";
import { GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<TransactionDatasource["updateTransaction"]>[0];

async function updateTransaction(params: Params) {
  try {
    await supabase
      .from("financial_transactions")
      .update({
        category: params.category,
        date: params.date,
        description: params.description,
        owner: params.owner,
        owner_id: params.ownerId,
        type: params.type,
        value: params.value,
      })
      .eq("id", params.id)
      .then();
  } catch (error) {
    const genericError = new GenericError();
    genericError.addContext({
      datasource: "TransactionDatasource - updateTransaction",
      error,
      params,
    });
    throw genericError;
  }
}

export default updateTransaction;
