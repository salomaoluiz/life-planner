import { mocks, setup, spies } from "./mocks/deleteCategory.mocks";

it("SHOULD delete a category successfully", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.responseMock);
  await setup();
  expect(spies.supabase.from).toHaveBeenCalledWith("financial_categories");
});
