import { Datasources } from "@data/datasource";
import DailyBalanceEntity from "@domain/entities/financial/DailyBalanceEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import { GetDailyBalancesDatasourceParams } from "./accountDatasource";

// Never cached: the balances move with every transaction write.
async function getDailyBalances(
  params: GetDailyBalancesDatasourceParams,
  datasources: Datasources,
) {
  const model =
    await datasources.financialAccountDatasource.getDailyBalances(params);

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
