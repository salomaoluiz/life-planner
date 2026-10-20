import {
  ApiBusinessError,
  CategoryArchived,
  CategoryHasPendingItems,
  CategoryParentArchived,
  FieldInvalid,
  GenericError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/updateCategory.mocks";

it("SHOULD PATCH /v1/finance/categories/:id with ONLY editable fields (no owner, ownerId, depthLevel or id)", async () => {
  spies.patch.mockResolvedValueOnce({});

  await expect(setup()).resolves.toBeUndefined();

  expect(spies.patch).toHaveBeenCalledWith(
    `/v1/finance/categories/${mocks.id}`,
    {
      icon: "store",
      iconColor: "#000000",
      name: "Supermarket",
      parentId: "2e1f9b4c-6d7f-4081-9ba2-c3d4e5f60718",
      type: "INCOME",
    },
  );
});

it("SHOULD send only the fields that are defined", async () => {
  spies.patch.mockResolvedValueOnce({});

  await setup({ ...mocks.onlyId, name: "Renamed" });

  const [, body] = spies.patch.mock.calls[0];
  expect(JSON.parse(JSON.stringify(body))).toEqual({ name: "Renamed" });
});

it("SHOULD send parentId null to make the category a root", async () => {
  spies.patch.mockResolvedValueOnce({});

  await setup({ ...mocks.onlyId, parentId: null });

  const [, body] = spies.patch.mock.calls[0];
  expect(body).toEqual(expect.objectContaining({ parentId: null }));
  expect(JSON.parse(JSON.stringify(body))).toEqual({ parentId: null });
});

it("SHOULD skip the request WHEN there is nothing editable to update", async () => {
  await setup({ ...mocks.onlyId, depthLevel: 4 });

  expect(spies.patch).not.toHaveBeenCalled();
});

it("SHOULD map a 400 (cycle / mismatch) to FieldInvalid", async () => {
  spies.patch.mockRejectedValueOnce(new ApiBusinessError("Bad Request", 400));

  expect(await setupThrowable()).toBeInstanceOf(FieldInvalid);
});

it("SHOULD map a 409 with the blockers body to CategoryHasPendingItems", async () => {
  const recurrence = {
    categoryId: "c1",
    description: "Gym",
    id: "r1",
    nextOccurrenceDate: "2026-11-05",
  };
  spies.patch.mockRejectedValueOnce(
    new ApiBusinessError(
      "Category has pending items",
      409,
      { hiddenCount: 1 },
      {
        blockers: { installmentPlans: [], recurrences: [recurrence] },
        hiddenCount: 1,
      },
    ),
  );

  const error = await setupThrowable({ ...mocks.onlyId, status: "ARCHIVED" });

  expect(error).toBeInstanceOf(CategoryHasPendingItems);
  expect(error).toMatchObject({
    hiddenCount: 1,
    installmentPlans: [],
    recurrences: [recurrence],
  });
});

it("SHOULD map a 409 without a blockers body to CategoryHasPendingItems with empty lists", async () => {
  spies.patch.mockRejectedValueOnce(
    new ApiBusinessError("Category type cannot be changed", 409),
  );

  expect(await setupThrowable()).toMatchObject({
    hiddenCount: 0,
    installmentPlans: [],
    recurrences: [],
  });
});

it("SHOULD send status to archive or reactivate", async () => {
  spies.patch.mockResolvedValueOnce({});

  await setup({ ...mocks.onlyId, status: "ARCHIVED" });

  const [, body] = spies.patch.mock.calls[0];
  expect(JSON.parse(JSON.stringify(body))).toEqual({ status: "ARCHIVED" });
});

it("SHOULD map the 422 archived messages to their errors AND wrap any other 422", async () => {
  spies.patch.mockRejectedValueOnce(
    new ApiBusinessError("Parent category is archived", 422),
  );
  expect(await setupThrowable()).toBeInstanceOf(CategoryParentArchived);

  spies.patch.mockRejectedValueOnce(
    new ApiBusinessError("Category is archived", 422),
  );
  expect(await setupThrowable()).toBeInstanceOf(CategoryArchived);

  spies.patch.mockRejectedValueOnce(
    new ApiBusinessError("System categories cannot be changed", 422),
  );
  expect(await setupThrowable()).toBeInstanceOf(GenericError);
});

it("SHOULD wrap unknown errors in GenericError with the category id only", async () => {
  spies.patch.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "CategoryDatasource - updateCategory",
    error: expect.any(Error),
    id: mocks.id,
  });
});

it("SHOULD send scope ALL to turn the category into an All category", async () => {
  spies.patch.mockResolvedValueOnce({});

  await setup({ ...mocks.onlyId, scope: "ALL" });

  const [, body] = spies.patch.mock.calls[0];
  expect(JSON.parse(JSON.stringify(body))).toEqual({ scope: "ALL" });
});
