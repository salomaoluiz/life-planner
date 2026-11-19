import { SplitDatasource } from "@data/repositories/repos/financial/splits/splitDatasource";

import api from "./api";

function financialSplitDatasource(): SplitDatasource {
  return api;
}

export default financialSplitDatasource;
