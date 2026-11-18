import {
  ApiBusinessError,
  ConnectivityError,
  GenericError,
  StockNotEnoughQuantity,
  StockUndoTooLate,
} from "@domain/entities/errors";

import { classifyFailure } from "./quickMovementErrors";

function generic(status?: number) {
  const error = new GenericError();

  error.addContext({
    error: status ? new ApiBusinessError("x", status) : new Error("boom"),
  });

  return error;
}

it("SHOULD keep the entry WHEN there is no connection or the server failed", () => {
  expect(classifyFailure(new ConnectivityError())).toEqual({ kind: "OFFLINE" });
  expect(classifyFailure(generic())).toEqual({ kind: "OFFLINE" });
  expect(classifyFailure(new Error("?"))).toEqual({ kind: "OFFLINE" });
});

it.each([
  [new StockNotEnoughQuantity(), "stock.offline.reasonNotEnough"],
  [new StockUndoTooLate(), "stock.quick.undoTooLate"],
  [generic(404), "stock.offline.reasonGone"],
  [generic(409), "stock.offline.reasonRejected"],
  [generic(422), "stock.offline.reasonRejected"],
])("SHOULD refuse %#", (error, reasonKey) => {
  expect(classifyFailure(error)).toEqual({ kind: "REFUSED", reasonKey });
});
