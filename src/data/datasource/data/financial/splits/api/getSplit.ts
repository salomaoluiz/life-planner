import SplitModel, {
  SplitWithLookups,
} from "@data/models/financial/SplitModel";
import { SplitDatasource } from "@data/repositories/repos/financial/splits/splitDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Response = ReturnType<SplitDatasource["getSplit"]>;

async function getSplit(id: string): Response {
  try {
    const response = await api.get<SplitWithLookups>(
      `/v1/finance/splits/${id}`,
    );

    return SplitModel.fromResponse(response);
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "SplitDatasource - getSplit",
      id,
    });
  }
}

export default getSplit;
