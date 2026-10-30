import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import CategoryIconModel from "@data/models/financial/CategoryIconModel";

import getCategoryIcons from "./getCategoryIcons";

it("SHOULD map the models to entities and pass the params through", async () => {
  jest
    .mocked(datasourcesMocks.financialCategoryDatasource)
    .getCategoryIcons.mockResolvedValue([
      new CategoryIconModel({
        common: true,
        group: "FOOD",
        labelEn: "Food",
        labelPt: "Comida",
        name: "food",
      }),
    ]);

  const result = await getCategoryIcons({ q: "food" }, datasourcesMocks);

  expect(
    datasourcesMocks.financialCategoryDatasource.getCategoryIcons,
  ).toHaveBeenCalledWith({ q: "food" });
  expect(result).toEqual([
    {
      common: true,
      group: "FOOD",
      labelEn: "Food",
      labelPt: "Comida",
      name: "food",
    },
  ]);
});
