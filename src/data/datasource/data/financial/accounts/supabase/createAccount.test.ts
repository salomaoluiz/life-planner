import { BusinessError, GenericError } from "@domain/entities/errors";
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

type ThenMock = { then: jest.Mock };
const thenMock = (supabase as unknown as ThenMock).then;

const params = {
  balance: 100,
  icon: "icon",
  name: "Acc",
  owner: OwnerType.USER,
  ownerId: "user-id",
  status: "ACTIVE",
};

it("SHOULD throw a GenericError with context WHEN supabase returns an error", async () => {
  thenMock.mockResolvedValueOnce({ data: null, error: { message: "boom" } });

  const error = await createAccount(params).catch((e) => e);

  expect(error).toBeInstanceOf(GenericError);
  expect(error.context).toMatchObject({
    datasource: "AccountDatasource - createAccount",
    params,
  });
});

it("SHOULD throw a GenericError WHEN the response has no data", async () => {
  thenMock.mockResolvedValueOnce({ data: null, error: null });

  await expect(createAccount(params)).rejects.toBeInstanceOf(GenericError);
});

it("SHOULD rethrow a BusinessError untouched", async () => {
  const businessError = new BusinessError();
  thenMock.mockRejectedValueOnce(businessError);

  await expect(createAccount(params)).rejects.toBe(businessError);
});
