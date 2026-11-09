import { TransferDatasource } from "@data/repositories/repos/financial/transfers/transferDatasource";

import api from "./api";

function financialTransferDatasource(): TransferDatasource {
  return api;
}

export default financialTransferDatasource;
