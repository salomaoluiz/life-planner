import { BusinessError, GenericError } from "@domain/entities/errors";
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

type ThenMock = { then: jest.Mock };
const thenMock = (supabase as unknown as ThenMock).then;
const eqMock = (supabase as unknown as { eq: jest.Mock }).eq;

const params = { id: "acc-id", ownerId: "user-id" };

it("SHOULD delete by id and owner id", async () => {
  await deleteAccount(params);

  expect(eqMock).toHaveBeenCalledWith("id", "acc-id");
  expect(eqMock).toHaveBeenCalledWith("owner_id", "user-id");
});

it("SHOULD throw a GenericError with context WHEN supabase returns an error", async () => {
  thenMock.mockResolvedValueOnce({ error: { message: "boom" } });

  const error = await deleteAccount(params).catch((e) => e);

  expect(error).toBeInstanceOf(GenericError);
  expect(error.context).toMatchObject({
    datasource: "AccountDatasource - deleteAccount",
    params,
  });
});

it("SHOULD rethrow a BusinessError untouched", async () => {
  const businessError = new BusinessError();
  thenMock.mockRejectedValueOnce(businessError);

  await expect(deleteAccount(params)).rejects.toBe(businessError);
});
