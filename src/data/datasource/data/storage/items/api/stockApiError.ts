import {
  ApiBusinessError,
  BusinessError,
  GenericError,
} from "@domain/entities/errors";

// Session/connectivity errors are handled globally; every other failure is a GenericError.
// `context` must only hold ids: never the request body (notes are free text).
function handleStockApiError(
  error: unknown,
  context: Record<string, unknown>,
): never {
  if (error instanceof BusinessError && !(error instanceof ApiBusinessError)) {
    throw error;
  }

  const genericError = new GenericError();
  genericError.addContext({ ...context, error });
  throw genericError;
}

export default handleStockApiError;
