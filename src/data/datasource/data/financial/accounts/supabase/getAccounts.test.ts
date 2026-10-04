import { BusinessError, GenericError } from "@domain/entities/errors";
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

type ThenMock = { then: jest.Mock };
const thenMock = (supabase as unknown as ThenMock).then;

it("SHOULD return an empty list WHEN the response has no data", async () => {
  thenMock.mockResolvedValueOnce({ data: null, error: null });

  expect(await getAccounts(["user-id"])).toEqual([]);
});

it("SHOULD throw a GenericError with context WHEN supabase returns an error", async () => {
  thenMock.mockResolvedValueOnce({ data: null, error: { message: "boom" } });

  const error = await getAccounts(["user-id"]).catch((e) => e);

  expect(error).toBeInstanceOf(GenericError);
  expect(error.context).toMatchObject({
    datasource: "AccountDatasource - getAccounts",
    ownerIds: ["user-id"],
  });
});

it("SHOULD rethrow a BusinessError untouched", async () => {
  const businessError = new BusinessError();
  thenMock.mockRejectedValueOnce(businessError);

  await expect(getAccounts(["user-id"])).rejects.toBe(businessError);
});
