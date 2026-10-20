import {
  ApiBusinessError,
  BusinessError,
  GenericError,
} from "@domain/entities/errors";

type ErrorMap = Partial<
  Record<number, (error: ApiBusinessError) => BusinessError | undefined>
>;

function handleFamilyApiError(
  error: unknown,
  context: Record<string, unknown>,
  errorMap: ErrorMap = {},
): never {
  if (error instanceof ApiBusinessError) {
    const mapped = errorMap[error.statusCode]?.(error);

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

export default handleFamilyApiError;
