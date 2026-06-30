import { supabase } from "@infrastructure/supabase";

import deleteAccount from "./deleteAccount";

jest.mock("@infrastructure/supabase", () => ({
  supabase: {
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    then: jest.fn().mockResolvedValue({
      error: null,
    }),
  },
}));

it("SHOULD call supabase to delete account", async () => {
  await deleteAccount({ id: "acc-id", ownerId: "user-id" });
  expect(supabase.from).toHaveBeenCalledWith("financial_accounts");
});
