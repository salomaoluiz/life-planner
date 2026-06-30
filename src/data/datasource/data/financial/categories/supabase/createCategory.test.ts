import CategoryModel from "@data/models/financial/CategoryModel";

import { mocks, setup, spies } from "./mocks/createCategory.mocks";

it("SHOULD create a category successfully", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.responseMock);
  const result = await setup();
  expect(spies.supabase.from).toHaveBeenCalledWith("financial_categories");
  expect(result).toBeInstanceOf(CategoryModel);
});
