import {
  ApiBusinessError,
  ConnectivityError,
  GenericError,
  UserNotLoggedError,
} from "@domain/entities/errors";

import handleStockApiError from "./stockApiError";

function run(error: unknown) {
  try {
    handleStockApiError(error, {
      datasource: "StockDatasource - test",
      id: "item-id",
    });
  } catch (thrown) {
    return thrown;
  }
}

it.each([
  ["ConnectivityError", new ConnectivityError()],
  ["UserNotLoggedError", new UserNotLoggedError()],
])("SHOULD re-throw %s untouched", (_name, error) => {
  expect(run(error)).toBe(error);
});

it.each([400, 403, 404, 409])(
  "SHOULD wrap an API %s in GenericError with the ids-only context",
  (status) => {
    const apiError = new ApiBusinessError("Request failed", status);

    const thrown = run(apiError);

    expect(thrown).toBeInstanceOf(GenericError);
    expect(thrown).toHaveProperty("context", {
      datasource: "StockDatasource - test",
      error: apiError,
      id: "item-id",
    });
  },
);

it("SHOULD wrap unknown errors in GenericError", () => {
  expect(run(new Error("boom"))).toBeInstanceOf(GenericError);
});
