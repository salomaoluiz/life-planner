import {
  ApiBusinessError,
  ConnectivityError,
  GenericError,
  StockCatalogNameTaken,
  StockCatalogRule,
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

it("SHOULD keep an unrelated 409 as GenericError, not one of the stock conflicts", () => {
  expect(
    run(new ApiBusinessError("Something else", 409, {}, {})),
  ).toBeInstanceOf(GenericError);
  expect(
    run(new ApiBusinessError("Category is in use", 409, {}, {})),
  ).toBeInstanceOf(GenericError);
  expect(
    run(new ApiBusinessError("Location is in use", 409, {}, {})),
  ).toBeInstanceOf(GenericError);
  expect(
    run(new ApiBusinessError("Not enough quantity", 422, {}, {})),
  ).toBeInstanceOf(GenericError);
});

it("SHOULD map a duplicate sibling name to StockCatalogNameTaken (spec 125)", () => {
  expect(
    run(
      new ApiBusinessError(
        "A category with this name already exists here",
        409,
        {},
        {},
      ),
    ),
  ).toBeInstanceOf(StockCatalogNameTaken);
});

it.each([
  ["Icon not found", { code: "ICON_NOT_FOUND" }],
  ["Move target", { code: "INVALID_MOVE_TARGET" }],
  ["Locations go up to 2 levels", {}],
  ["Parent location is archived", {}],
])("SHOULD map the 422 %s to StockCatalogRule", (message, body) => {
  const thrown = run(new ApiBusinessError(message, 422, {}, body));

  expect(thrown).toBeInstanceOf(StockCatalogRule);
});

it("SHOULD keep other 422 as GenericError", () => {
  expect(run(new ApiBusinessError("Other", 422, {}, {}))).toBeInstanceOf(
    GenericError,
  );
});

it("SHOULD wrap unknown errors in GenericError", () => {
  expect(run(new Error("boom"))).toBeInstanceOf(GenericError);
});
