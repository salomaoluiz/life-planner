import { BusinessError, GenericError } from "@domain/entities/errors";

import { mocks, setup, spies } from "./mocks/updateCategory.mocks";

it("SHOULD update a category successfully", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.responseMock);
  await setup();
  expect(spies.supabase.from).toHaveBeenCalledWith("financial_categories");
});

it("SHOULD throw a GenericError with context WHEN supabase returns an error", async () => {
  spies.supabase.then.mockResolvedValueOnce({
    data: null,
    error: { message: "boom" },
  });

  const error = await setup().catch((e) => e);

  expect(error).toBeInstanceOf(GenericError);
  expect(error.context).toMatchObject({
    datasource: "CategoryDatasource - updateCategory",
  });
});

it("SHOULD rethrow a BusinessError untouched", async () => {
  const businessError = new BusinessError();
  spies.supabase.then.mockRejectedValueOnce(businessError);

  await expect(setup()).rejects.toBe(businessError);
});
