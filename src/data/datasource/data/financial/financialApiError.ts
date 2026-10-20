import {
  ApiBusinessError,
  BusinessError,
  FieldInvalid,
  FinancialNotFound,
  FinancialOwnerNotAllowed,
  GenericError,
} from "@domain/entities/errors";

interface Options {
  conflict?: (
    details: Record<string, number>,
    body: Record<string, unknown>,
  ) => BusinessError | undefined;
  fields?: Record<string, unknown>;
  unprocessable?: (message: string) => BusinessError | undefined;
}

function handleFinancialApiError(
  error: unknown,
  context: Record<string, unknown>,
  options: Options = {},
): never {
  if (error instanceof ApiBusinessError) {
    const mapped = mapStatus(
      error.statusCode,
      error.message,
      error.details,
      error.body,
      options,
    );

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
  details: Record<string, number>,
  body: Record<string, unknown>,
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
      return options.conflict?.(details, body);
    case 422:
      return options.unprocessable?.(message);
    default:
      return undefined;
  }
}

export default handleFinancialApiError;
