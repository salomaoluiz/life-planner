import {
  ApiBusinessError,
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

it("SHOULD wrap a 409 (type change not allowed) in GenericError", async () => {
  spies.patch.mockRejectedValueOnce(
    new ApiBusinessError("Category type cannot be changed", 409),
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
