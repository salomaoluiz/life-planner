import {
  ApiBusinessError,
  BusinessError,
  GenericError,
  StockCategoryInUse,
  StockLocationInUse,
  StockLotAlreadyOpen,
  StockNotEnoughQuantity,
} from "@domain/entities/errors";

// Session/connectivity errors are handled globally; every other failure is a GenericError.
// `context` must only hold ids: never the request body (notes are free text).
function handleStockApiError(
  error: unknown,
  context: Record<string, unknown>,
): never {
  if (error instanceof ApiBusinessError) {
    const conflict = mapConflict(error);

    if (conflict) {
      throw conflict;
    }
  }

  if (error instanceof BusinessError && !(error instanceof ApiBusinessError)) {
    throw error;
  }

  const genericError = new GenericError();
  genericError.addContext({ ...context, error });
  throw genericError;
}

// The conflicts the screens explain (spec 116): `409` with its message or its `itemCount`.
function mapConflict(error: ApiBusinessError): BusinessError | undefined {
  if (error.statusCode !== 409) {
    return undefined;
  }

  if (error.message.includes("Not enough quantity")) {
    return new StockNotEnoughQuantity();
  }

  if (error.message.includes("already open")) {
    return new StockLotAlreadyOpen();
  }

  const itemCount = Number(error.body.itemCount);

  if (!Number.isNaN(itemCount) && error.message.startsWith("Category")) {
    return new StockCategoryInUse(itemCount);
  }

  if (!Number.isNaN(itemCount) && error.message.startsWith("Location")) {
    return new StockLocationInUse(itemCount);
  }

  return undefined;
}

export default handleStockApiError;
