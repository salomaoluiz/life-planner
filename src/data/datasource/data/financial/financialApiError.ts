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
}

function handleFinancialApiError(
  error: unknown,
  context: Record<string, unknown>,
  options: Options = {},
): never {
  if (error instanceof ApiBusinessError) {
    const mapped = mapStatus(error.statusCode, options);

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
    default:
      return undefined;
  }
}

export default handleFinancialApiError;
