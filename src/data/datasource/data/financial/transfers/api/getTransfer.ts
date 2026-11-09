import TransferModel, {
  TransferWithRows,
} from "@data/models/financial/TransferModel";
import { TransferDatasource } from "@data/repositories/repos/financial/transfers/transferDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Response = ReturnType<TransferDatasource["getTransfer"]>;

async function getTransfer(id: string): Response {
  try {
    const response = await api.get<TransferWithRows>(
      `/v1/finance/transfers/${id}`,
    );

    return TransferModel.fromResponse(response);
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "TransferDatasource - getTransfer",
      id,
    });
  }
}

export default getTransfer;
