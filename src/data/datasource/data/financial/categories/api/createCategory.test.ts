import CategoryModel from "@data/models/financial/CategoryModel";
import {
  ApiBusinessError,
  FieldInvalid,
  FinancialNotFound,
  GenericError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/createCategory.mocks";

it("SHOULD POST /v1/finance/categories WITHOUT depthLevel AND with the black token as #000000", async () => {
  spies.post.mockResolvedValueOnce(mocks.apiCategory);

  const result = await setup();

  expect(spies.post).toHaveBeenCalledWith("/v1/finance/categories", {
    icon: "store",
    iconColor: "#000000",
    name: "Supermarket",
    owner: "FAMILY",
    ownerId: mocks.params.ownerId,
    parentId: mocks.params.parentId,
    type: "EXPENSE",
  });
  expect(result).toEqual(CategoryModel.fromJSON(mocks.apiCategory));
});

it("SHOULD keep a hex color AND leave parentId out for a root category", async () => {
  spies.post.mockResolvedValueOnce(mocks.apiCategory);

  await setup({ iconColor: "#007bff", parentId: undefined });

  const [, body] = spies.post.mock.calls[0];
  expect(JSON.parse(JSON.stringify(body))).toEqual({
    icon: "store",
    iconColor: "#007bff",
    name: "Supermarket",
    owner: "FAMILY",
    ownerId: mocks.params.ownerId,
    type: "EXPENSE",
  });
});

it("SHOULD default the color to #000000 WHEN the params carry none", async () => {
  spies.post.mockResolvedValueOnce(mocks.apiCategory);

  await setup({ iconColor: undefined });

  expect(spies.post).toHaveBeenCalledWith(
    "/v1/finance/categories",
    expect.objectContaining({ iconColor: "#000000" }),
  );
});

it("SHOULD map a 400 to FieldInvalid AND a 404 (parent not found) to FinancialNotFound", async () => {
  spies.post.mockRejectedValueOnce(
    new ApiBusinessError("Validation Failed", 400),
  );
  expect(await setupThrowable()).toBeInstanceOf(FieldInvalid);

  spies.post.mockRejectedValueOnce(
    new ApiBusinessError("Parent category not found", 404),
  );
  expect(await setupThrowable()).toBeInstanceOf(FinancialNotFound);
});

it("SHOULD wrap unknown errors in GenericError with the owner id only", async () => {
  spies.post.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "CategoryDatasource - createCategory",
    error: expect.any(Error),
    ownerId: mocks.params.ownerId,
  });
});
