import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/deleteCategory.mocks";

it("SHOULD call the supabase to delete category", async () => {
  spies.supabase.then.mockResolvedValueOnce(null);

  await setup();

  expect(spies.supabase.from).toHaveBeenCalledTimes(1);
  expect(spies.supabase.from).toHaveBeenCalledWith("financial_categories");
  expect(spies.supabase.delete).toHaveBeenCalledWith();
  expect(spies.supabase.delete).toHaveBeenCalledTimes(1);
  expect(spies.supabase.eq).toHaveBeenCalledTimes(2);
  expect(spies.supabase.eq).toHaveBeenNthCalledWith(
    1,
    "id",
    mocks.defaultParams.id,
  );
  expect(spies.supabase.eq).toHaveBeenNthCalledWith(
    2,
    "owner_id",
    mocks.defaultParams.ownerId,
  );
  expect(spies.supabase.then).toHaveBeenCalledWith();
  expect(spies.supabase.then).toHaveBeenCalledTimes(1);
});

it("SHOULD throw an error if the supabase throws", async () => {
  spies.supabase.then.mockRejectedValueOnce(mocks.errors.unknown);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "CategoryDatasource - deleteCategory",
    error: mocks.errors.unknown,
    params: mocks.defaultParams,
  });
});
