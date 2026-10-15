import {
  ApiBusinessError,
  BusinessError,
  FieldInvalid,
  FinancialNotFound,
  FinancialOwnerNotAllowed,
  GenericError,
} from "@domain/entities/errors";

interface Options {
  conflict?: () => BusinessError;
  fields?: Record<string, unknown>;
  unprocessable?: (message: string) => BusinessError;
}

function handleFinancialApiError(
  error: unknown,
  context: Record<string, unknown>,
  options: Options = {},
): never {
  if (error instanceof ApiBusinessError) {
    const mapped = mapStatus(error.statusCode, error.message, options);

    if (mapped) {
      throw mapped;
    }
  } else if (error instanceof BusinessError) {
    throw error;
  }

  const genericError = new GenericError();
  genericError.addContext({ ...context, error });
  throw genericError;
}

function mapStatus(
  statusCode: number,
  message: string,
  options: Options,
): BusinessError | undefined {
  switch (statusCode) {
    case 400:
      return new FieldInvalid(options.fields ?? {});
    case 403:
      return new FinancialOwnerNotAllowed();
    case 404:
      return new FinancialNotFound();
    case 409:
      return options.conflict?.();
    case 422:
      return options.unprocessable?.(message);
    default:
      return undefined;
  }
}

export default handleFinancialApiError;
