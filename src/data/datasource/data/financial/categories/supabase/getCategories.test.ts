import CategoryModel from "@data/models/financial/CategoryModel";
import { BusinessError, GenericError } from "@domain/entities/errors";

import { mocks, setup, spies } from "./mocks/getCategories.mocks";

it("SHOULD get categories successfully", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.responseMock);
  const result = await setup();
  expect(spies.supabase.from).toHaveBeenCalledWith("financial_categories");
  expect(result).toBeInstanceOf(Array);
  expect(result[0]).toBeInstanceOf(CategoryModel);
});

it("SHOULD throw a GenericError with context WHEN the response has no data", async () => {
  spies.supabase.then.mockResolvedValueOnce({ data: null, error: null });

  const error = await setup().catch((e) => e);

  expect(error).toBeInstanceOf(GenericError);
  expect(error.context).toMatchObject({
    datasource: "CategoryDatasource - getCategories",
  });
});

it("SHOULD rethrow a BusinessError untouched", async () => {
  const businessError = new BusinessError();
  spies.supabase.then.mockRejectedValueOnce(businessError);

  await expect(setup()).rejects.toBe(businessError);
});
