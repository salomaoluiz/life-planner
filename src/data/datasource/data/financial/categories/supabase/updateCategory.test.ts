import { mocks, setup, spies } from "./mocks/updateCategory.mocks";

it("SHOULD update a category successfully", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.responseMock);
  await setup();
  expect(spies.supabase.from).toHaveBeenCalledWith("financial_categories");
});
