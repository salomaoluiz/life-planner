import {
  ApiBusinessError,
  ConnectivityError,
  FamilyArchived,
  FamilyHasPendingItems,
  FamilyNotFound,
  FieldInvalid,
  GenericError,
} from "@domain/entities/errors";
import { FamilyStatus } from "@domain/entities/family/FamilyStatus";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/updateFamily.mocks";
import updateFamily from "./updateFamily";

it("SHOULD PATCH /v1/families/:id with only the name", async () => {
  spies.patch.mockResolvedValueOnce({});

  await expect(setup()).resolves.toBeUndefined();

  expect(spies.patch).toHaveBeenCalledWith(`/v1/families/${mocks.params.id}`, {
    name: mocks.params.name,
  });
});

it("SHOULD throw FamilyNotFound WHEN the API answers 404", async () => {
  spies.patch.mockRejectedValueOnce(new ApiBusinessError("Not Found", 404));

  expect(await setupThrowable()).toBeInstanceOf(FamilyNotFound);
});

it("SHOULD throw FieldInvalid WHEN the API answers 400", async () => {
  spies.patch.mockRejectedValueOnce(
    new ApiBusinessError("Validation Failed", 400),
  );

  expect(await setupThrowable()).toBeInstanceOf(FieldInvalid);
});

it("SHOULD wrap a 403 (member but not owner) in GenericError, like any unexpected answer", async () => {
  spies.patch.mockRejectedValueOnce(new ApiBusinessError("Forbidden", 403));

  expect(await setupThrowable()).toBeInstanceOf(GenericError);
});

it("SHOULD re-throw other business errors", async () => {
  const error = new ConnectivityError();
  spies.patch.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap unknown errors in GenericError with the id only", async () => {
  spies.patch.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "FamilyDatasource - updateFamily",
    error: expect.any(Error),
    id: mocks.params.id,
  });
});

it("SHOULD PATCH only the status to archive or reactivate", async () => {
  spies.patch.mockResolvedValueOnce({});

  await updateFamily({ id: mocks.params.id, status: FamilyStatus.ARCHIVED });

  expect(spies.patch).toHaveBeenCalledWith(`/v1/families/${mocks.params.id}`, {
    name: undefined,
    status: "ARCHIVED",
  });
});

it("SHOULD throw FamilyHasPendingItems with the blockers WHEN the API answers 409", async () => {
  const blockers = {
    pendingInvites: [{ email: "test@example.com", id: "invite-1" }],
    recurrences: [
      { description: "Rent", id: "rec-1", nextOccurrenceDate: "2026-11-05" },
    ],
  };
  spies.patch.mockRejectedValueOnce(
    new ApiBusinessError(
      "Family has pending items",
      409,
      {},
      { blockers, counts: { pendingInvites: 1 } },
    ),
  );

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(FamilyHasPendingItems);
  expect((error as FamilyHasPendingItems).blockers).toEqual({
    installmentPlans: [],
    invoices: [],
    pendingInvites: blockers.pendingInvites,
    recurrences: blockers.recurrences,
    unpaidTransactions: [],
  });
});

it("SHOULD wrap a 409 without blockers in GenericError", async () => {
  spies.patch.mockRejectedValueOnce(new ApiBusinessError("Conflict", 409));

  expect(await setupThrowable()).toBeInstanceOf(GenericError);
});

it("SHOULD throw FamilyArchived WHEN the API answers 422", async () => {
  spies.patch.mockRejectedValueOnce(
    new ApiBusinessError("Family is archived", 422),
  );

  expect(await setupThrowable()).toBeInstanceOf(FamilyArchived);
});
