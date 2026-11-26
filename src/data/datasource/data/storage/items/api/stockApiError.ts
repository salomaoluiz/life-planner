import {
  ApiBusinessError,
  BusinessError,
  GenericError,
  StockBarcodeInUse,
  StockBarcodeInvalid,
  StockCatalogNameTaken,
  StockCatalogRule,
  StockCategoryInUse,
  StockLocationInUse,
  StockLotAlreadyOpen,
  StockNotEnoughQuantity,
  StockUndoTooLate,
} from "@domain/entities/errors";

// Session/connectivity errors are handled globally; every other failure is a GenericError.
// `context` must only hold ids: never the request body (notes are free text).
function handleStockApiError(
  error: unknown,
  context: Record<string, unknown>,
): never {
  if (error instanceof ApiBusinessError) {
    const barcode = mapBarcode(error);

    if (barcode) {
      throw barcode;
    }

    const conflict = mapConflict(error) ?? mapCatalogRule(error);

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

// Spec 121: `409 BARCODE_IN_USE { itemId, description }` and `400|422` for a code that is not valid.
function mapBarcode(error: ApiBusinessError): BusinessError | undefined {
  if (error.statusCode === 409 && error.body.code === "BARCODE_IN_USE") {
    return new StockBarcodeInUse(
      String(error.body.itemId ?? ""),
      String(error.body.description ?? ""),
    );
  }

  if (
    (error.statusCode === 422 && error.body.code === "BARCODE_INVALID") ||
    (error.statusCode === 400 && error.message.includes("barcode"))
  ) {
    return new StockBarcodeInvalid();
  }

  return undefined;
}

// Spec 125: the 422 of the catalog writes the form explains (depth, archived parent, unknown icon, move target).
function mapCatalogRule(error: ApiBusinessError): BusinessError | undefined {
  const code =
    typeof error.body.code === "string" ? error.body.code : undefined;

  if (
    error.statusCode === 422 &&
    (code === "ICON_NOT_FOUND" ||
      code === "INVALID_MOVE_TARGET" ||
      /levels|archived|parent|itself|Reactivate/.test(error.message))
  ) {
    return new StockCatalogRule(code);
  }

  return undefined;
}

// The conflicts the screens explain (spec 116): `409` with its message or its `itemCount`.
function mapConflict(error: ApiBusinessError): BusinessError | undefined {
  if (error.statusCode !== 409) {
    return undefined;
  }

  if (error.message.includes("Not enough quantity")) {
    return new StockNotEnoughQuantity();
  }

  if (error.message.includes("desfazer")) {
    return new StockUndoTooLate();
  }

  if (error.message.includes("already open")) {
    return new StockLotAlreadyOpen();
  }

  if (error.message.includes("already exists")) {
    return new StockCatalogNameTaken();
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
