import { BusinessError, GenericError } from "@domain/entities/errors";
import { useReactMutation } from "@infrastructure/fetcher/reactQuery";
import { UseMutation } from "@infrastructure/fetcher/types";

function useMutation<Params, Response>(
  props: Parameters<UseMutation<Params, Response>>[0],
): ReturnType<UseMutation<Params, Response>> {
  const { data, error, mutate, status, variables } = useReactMutation<
    Response,
    BusinessError | GenericError,
    Params
  >({
    mutationFn: props.fetch,
    mutationKey: props.cacheKey,
    retry: props.retry,
    retryDelay: props.retryDelay,
  });

  function getError() {
    if (!error) {
      return null;
    }

    if (error instanceof BusinessError) {
      error.addContext({
        ...error.context,
        cacheString: props.cacheKey.join("-"),
        variables,
      });
      return error;
    }

    const genericError = new GenericError();
    genericError.message = error?.message ?? "Without error message";
    genericError.addContext({
      ...error.context,
      cacheString: props.cacheKey.join("-"),
      variables,
    });

    throw genericError;
  }

  return {
    data,
    error: getError(),
    isFetching: status === "pending",
    mutate,
    status,
  };
}

export default useMutation;
