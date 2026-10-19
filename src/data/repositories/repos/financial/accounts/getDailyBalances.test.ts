import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import DailyBalanceModel from "@data/models/financial/DailyBalanceModel";
import DailyBalanceEntity from "@domain/entities/financial/DailyBalanceEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import getDailyBalances from "./getDailyBalances";

it("SHOULD fetch from the datasource AND map the model to the entity", async () => {
  const model = new DailyBalanceModel({
    accounts: [
      {
        icon: "bank",
        id: "a1",
        name: "Checking",
        owner: "USER" as never,
        ownerId: "u1",
      },
    ],
    days: [
      {
        accounts: [{ accountId: "a1", balanceCents: 10 }],
        cardsDueCents: 0,
        date: "2026-11-01",
        projected: false,
        totalCents: 10,
      },
    ],
    month: "2026-11",
  });
  jest
    .mocked(datasourcesMocks.financialAccountDatasource.getDailyBalances)
    .mockResolvedValueOnce(model);

  const params = { month: "2026-11", ownerIds: ["u1"] };
  const result = await getDailyBalances(params, datasourcesMocks);

  expect(
    datasourcesMocks.financialAccountDatasource.getDailyBalances,
  ).toHaveBeenCalledWith(params);
  expect(result).toBeInstanceOf(DailyBalanceEntity);
  expect(result.accounts[0].owner).toBe(OwnerType.USER);
  expect(result.days).toEqual(model.days);
});
