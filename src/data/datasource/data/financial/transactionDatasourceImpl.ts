import TransactionModel from "@data/models/financial/TransactionModel";
import { TransactionDatasource } from "@data/repositories/repos/financial/transactionDatasource";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

function transactionDatasourceImpl(): TransactionDatasource {
  return {
    async createTransaction(params): Promise<TransactionModel> {
      try {
        const response = await supabase
          .from("financial-transactions")
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
          error,
          params,
        });

        throw genericError;
      }
    },
    async deleteTransaction(params): Promise<void> {
      try {
        await supabase
          .from("financial-transactions")
          .delete()
          .eq("id", params.id)
          .eq("owner_id", params.ownerId)
          .then();
      } catch (error) {
        const genericError = new GenericError();
        genericError.addContext({
          error,
          params,
        });
        throw genericError;
      }
    },
    async getTransactions(ownerIds): Promise<TransactionModel[]> {
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
        genericError.addContext({ error, ownerIds });
        throw genericError;
      }
    },
    async updateTransaction(params): Promise<void> {
      try {
        await supabase
          .from("financial-transactions")
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
          error,
          params: params,
        });
        throw genericError;
      }
    },
  };
}

export default transactionDatasourceImpl;
