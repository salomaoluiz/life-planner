import { BusinessError, GenericError } from "@domain/entities/errors";
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

type ThenMock = { then: jest.Mock };
const thenMock = (supabase as unknown as ThenMock).then;
const eqMock = (supabase as unknown as { eq: jest.Mock }).eq;

it("SHOULD filter by owner id WHEN it is provided", async () => {
  await updateAccount({ id: "acc-id", name: "Updated", ownerId: "user-id" });

  expect(eqMock).toHaveBeenCalledWith("id", "acc-id");
  expect(eqMock).toHaveBeenCalledWith("owner_id", "user-id");
});

it("SHOULD NOT filter by owner id WHEN it is not provided", async () => {
  eqMock.mockClear();

  await updateAccount({ id: "acc-id", name: "Updated" });

  expect(eqMock).toHaveBeenCalledTimes(1);
  expect(eqMock).toHaveBeenCalledWith("id", "acc-id");
});

it("SHOULD throw a GenericError with context WHEN supabase returns an error", async () => {
  thenMock.mockResolvedValueOnce({ error: { message: "boom" } });

  const error = await updateAccount({ id: "acc-id", name: "x" }).catch(
    (e) => e,
  );

  expect(error).toBeInstanceOf(GenericError);
  expect(error.context).toMatchObject({
    datasource: "AccountDatasource - updateAccount",
    params: { id: "acc-id", name: "x" },
  });
});

it("SHOULD rethrow a BusinessError untouched", async () => {
  const businessError = new BusinessError();
  thenMock.mockRejectedValueOnce(businessError);

  await expect(updateAccount({ id: "acc-id" })).rejects.toBe(businessError);
});
