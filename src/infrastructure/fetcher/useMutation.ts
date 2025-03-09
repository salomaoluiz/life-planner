import { UseMutation } from "@infrastructure/fetcher/types";
import { useReactMutation } from "@infrastructure/fetcher/reactQuery";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { captureException } from "@infrastructure/monitoring";

function useMutation<Params, Response>(
  props: Parameters<UseMutation<Params, Response>>[0],
): ReturnType<UseMutation<Params, Response>> {
  const { data, error, status, mutate, variables } = useReactMutation<
    Response,
    BusinessError | GenericError,
    Params
  >({
    mutationKey: props.cacheKey,
    mutationFn: props.fetch,
    retry: props.retry,
    retryDelay: props.retryDelay,
  });

  function getError() {
    if (!error) {
      return null;
    }

    if (error instanceof BusinessError) {
      error.addContext({
        cacheKey: props.cacheKey.join("-"),
        variables,
      });
      return error;
    }

    const genericError = new GenericError();
    genericError.message = error?.message || "Without error message";
    genericError.addContext({
      cacheKey: props.cacheKey.join("-"),
      variables,
    });

    captureException({
      name: "useMutation-failure",
      cause: genericError,
      message: genericError.message,
      stack: genericError?.stack,
    });

    throw genericError;
  }

  return {
    data,
    error: getError(),
    isFetching: status === "pending",
    status,
    mutate,
  };
}

export default useMutation;
