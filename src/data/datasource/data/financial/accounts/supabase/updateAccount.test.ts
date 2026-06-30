import { supabase } from "@infrastructure/supabase";

import updateAccount from "./updateAccount";

jest.mock("@infrastructure/supabase", () => ({
  supabase: {
    eq: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    then: jest.fn().mockResolvedValue({
      error: null,
    }),
    update: jest.fn().mockReturnThis(),
  },
}));

it("SHOULD call supabase to update account", async () => {
  await updateAccount({ id: "acc-id", name: "Updated Name" });
  expect(supabase.from).toHaveBeenCalledWith("financial_accounts");
});
