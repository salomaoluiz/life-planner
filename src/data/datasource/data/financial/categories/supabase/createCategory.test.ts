import CategoryModel from "@data/models/financial/CategoryModel";
import { BusinessError, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/createCategory.mocks";

it("SHOULD call the supabase to create a new category", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.success.response);

  await setup();

  expect(spies.supabase.from).toHaveBeenCalledTimes(1);
  expect(spies.supabase.from).toHaveBeenCalledWith("financial_categories");
  expect(spies.supabase.upsert).toHaveBeenCalledTimes(1);
  expect(spies.supabase.upsert).toHaveBeenCalledWith({
    depth_level: mocks.defaultParams.depthLevel,
    icon: mocks.defaultParams.icon,
    name: mocks.defaultParams.name,
    owner: mocks.defaultParams.owner,
    owner_id: mocks.defaultParams.ownerId,
    parent_id: mocks.defaultParams.parentId,
  });
  expect(spies.supabase.select).toHaveBeenCalledTimes(1);
  expect(spies.supabase.select).toHaveBeenCalledWith();
  expect(spies.supabase.then).toHaveBeenCalledTimes(1);
  expect(spies.supabase.then).toHaveBeenCalledWith();
});

it("SHOULD return a category model WHEN the response is success", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.success.response);

  const result = await setup();

  expect(result).toBeInstanceOf(CategoryModel);
  expect(result).toEqual(
    CategoryModel.fromJSON(mocks.success.response.data[0]),
  );
});

it("SHOULD throw an business error if the supabase return on", async () => {
  spies.supabase.then.mockRejectedValueOnce(mocks.errors.business);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(BusinessError);
  expect(error).toHaveProperty("context", {
    any_context: "any context",
  });
});

it("SHOULD throw a generic error if the supabase return an unknown error", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.errors.unknown);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "CategoryDatasource - createCategory",
    error: mocks.errors.unknown.error,
    params: mocks.defaultParams,
  });
});

it("SHOULD throw a generic error if the supabase return without data", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.errors.withoutData);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "CategoryDatasource - createCategory",
    error: new Error("Without data response"),
    params: mocks.defaultParams,
  });
});
