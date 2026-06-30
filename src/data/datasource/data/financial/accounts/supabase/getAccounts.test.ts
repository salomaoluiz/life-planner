import { supabase } from "@infrastructure/supabase";

import getAccounts from "./getAccounts";

jest.mock("@infrastructure/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    then: jest.fn().mockResolvedValue({
      data: [
        {
          balance: 200,
          icon: "icon",
          id: "acc-id-2",
          name: "Account",
          owner: "USER",
          owner_id: "user-id",
          status: "ACTIVE",
        },
      ],
      error: null,
    }),
  },
}));

it("SHOULD call supabase to get accounts", async () => {
  const result = await getAccounts(["user-id"]);
  expect(supabase.from).toHaveBeenCalledWith("financial_accounts");
  expect(result).toHaveLength(1);
});
