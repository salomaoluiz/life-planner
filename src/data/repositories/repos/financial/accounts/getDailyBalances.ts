import { Datasources } from "@data/datasource";
import DailyBalanceModel from "@data/models/financial/DailyBalanceModel";
import DailyBalanceEntity from "@domain/entities/financial/DailyBalanceEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import { GetDailyBalancesDatasourceParams } from "./accountDatasource";

// Never cached: the balances move with every transaction write.
async function getDailyBalances(
  params: GetDailyBalancesDatasourceParams,
  datasources: Datasources,
) {
  return toDailyBalanceEntity(
    await datasources.financialAccountDatasource.getDailyBalances(params),
  );
}

function toDailyBalanceEntity(model: DailyBalanceModel) {
  return new DailyBalanceEntity({
    accounts: model.accounts.map((account) => ({
      ...account,
      owner: OwnerType[account.owner],
    })),
    days: model.days,
    month: model.month,
  });
}

export default getDailyBalances;
export { toDailyBalanceEntity };
