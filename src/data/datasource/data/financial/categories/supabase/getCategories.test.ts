import CategoryModel from "@data/models/financial/CategoryModel";

import { mocks, setup, spies } from "./mocks/getCategories.mocks";

it("SHOULD get categories successfully", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.responseMock);
  const result = await setup();
  expect(spies.supabase.from).toHaveBeenCalledWith("financial_categories");
  expect(result).toBeInstanceOf(Array);
  expect(result[0]).toBeInstanceOf(CategoryModel);
});
