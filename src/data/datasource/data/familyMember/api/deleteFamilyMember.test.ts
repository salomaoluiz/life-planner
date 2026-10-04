import {
  ApiBusinessError,
  ConnectivityError,
  FamilyNotFound,
  GenericError,
  UserNotLoggedError,
} from "@domain/entities/errors";

import { setup, setupThrowable, spies } from "./mocks/deleteFamilyMember.mocks";

it("SHOULD DELETE the member by id AND resolve undefined", async () => {
  spies.delete.mockResolvedValueOnce(undefined);

  expect(await setup()).toBeUndefined();
  expect(spies.delete).toHaveBeenCalledWith("/v1/family-members/member-1");
});

it("SHOULD map 404 to FamilyNotFound (member already removed)", async () => {
  spies.delete.mockRejectedValueOnce(new ApiBusinessError("x", 404));

  expect(await setupThrowable()).toBeInstanceOf(FamilyNotFound);
});

it.each([403, 409])(
  "SHOULD wrap an unmapped %s in GenericError",
  async (status) => {
    spies.delete.mockRejectedValueOnce(new ApiBusinessError("x", status));

    expect(await setupThrowable()).toBeInstanceOf(GenericError);
  },
);

it.each([
  ["ConnectivityError", new ConnectivityError()],
  ["UserNotLoggedError", new UserNotLoggedError()],
])("SHOULD re-throw %s", async (_name, error) => {
  spies.delete.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});
