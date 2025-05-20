import TransactionModel from "@data/models/financial/TransactionModel";
import { TransactionDatasource } from "@data/repositories/repos/financial/transactionDatasource";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<TransactionDatasource["createTransaction"]>[0];

async function createTransaction(params: Params): Promise<TransactionModel> {
  try {
    const response = await supabase
      .from("financial_transactions")
      .upsert({
        category: params.category,
        date: params.date,
        description: params.description,
        owner: params.owner,
        owner_id: params.ownerId,
        type: params.type,
        value: params.value,
      })
      .select()
      .then();

    if (response.error) {
      throw response.error;
    }

    if (!response.data) {
      throw new Error("Without data response");
    }

    return TransactionModel.fromJSON(response.data[0]);
  } catch (error) {
    if (error instanceof BusinessError) {
      throw error;
    }
    const genericError = new GenericError();
    genericError.addContext({
      datasource: "TransactionDatasource - createTransaction",
      error,
      params,
    });

    throw genericError;
  }
}

export default createTransaction;
