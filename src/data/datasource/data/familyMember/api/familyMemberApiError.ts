import {
  ApiBusinessError,
  BusinessError,
  GenericError,
} from "@domain/entities/errors";

type ErrorMap = Partial<Record<number, () => BusinessError>>;

function handleFamilyMemberApiError(
  error: unknown,
  context: Record<string, unknown>,
  errorMap: ErrorMap = {},
): never {
  if (error instanceof ApiBusinessError) {
    const mapped = errorMap[error.statusCode]?.();

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

export default handleFamilyMemberApiError;
