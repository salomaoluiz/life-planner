import { TransactionDatasource } from "@data/repositories/repos/financial/transactions/transactionDatasource";

import createTransaction from "./createTransaction";
import deleteTransaction from "./deleteTransaction";
import getTransactions from "./getTransactions";
import updateTransaction from "./updateTransaction";

function transactionDatasourceImpl(): TransactionDatasource {
  return {
    createTransaction,
    deleteTransaction,
    getTransactions,
    updateTransaction,
  };
}

export default transactionDatasourceImpl;
