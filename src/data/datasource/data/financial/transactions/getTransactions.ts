import TransactionModel from "@data/models/financial/TransactionModel";
import { TransactionDatasource } from "@data/repositories/repos/financial/transactionDatasource";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<TransactionDatasource["getTransactions"]>[0];

async function getTransactions(ownerIds: Params) {
  try {
    const transactions = await supabase
      .from("financial-transactions")
      .select()
      .in("owner_id", ownerIds)
      .then();

    if (!transactions.data) {
      throw new Error("Transaction without data");
    }

    return transactions.data.map<TransactionModel>((transaction) =>
      TransactionModel.fromJSON(transaction),
    );
  } catch (error) {
    if (error instanceof BusinessError) {
      throw error;
    }
    const genericError = new GenericError();
    genericError.addContext({
      datasource: "TransactionDatasource - getTransactions",
      error,
      ownerIds,
    });
    throw genericError;
  }
}

export default getTransactions;
