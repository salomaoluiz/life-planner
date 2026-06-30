import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { supabase } from "@infrastructure/supabase";

import createAccount from "./createAccount";

jest.mock("@infrastructure/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    then: jest.fn().mockResolvedValue({
      data: [
        {
          balance: 100,
          icon: "icon",
          id: "acc-id",
          name: "Acc",
          owner: "USER",
          owner_id: "user-id",
          status: "ACTIVE",
        },
      ],
      error: null,
    }),
    upsert: jest.fn().mockReturnThis(),
  },
}));

it("SHOULD call supabase to create account", async () => {
  const result = await createAccount({
    balance: 100,
    icon: "icon",
    name: "Acc",
    owner: OwnerType.USER,
    ownerId: "user-id",
    status: "ACTIVE",
  });

  expect(supabase.from).toHaveBeenCalledWith("financial_accounts");
  expect(result.id).toBe("acc-id");
});
