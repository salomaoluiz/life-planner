import { BusinessError, GenericError } from "@domain/entities/errors";
import { useReactMutation } from "@infrastructure/fetcher/reactQuery";
import { UseMutation } from "@infrastructure/fetcher/types";
import { addBreadcrumb } from "@infrastructure/monitoring";

function useMutation<Params, Response>(
  props: Parameters<UseMutation<Params, Response>>[0],
): ReturnType<UseMutation<Params, Response>> {
  const { data, error, mutate, reset, status, variables } = useReactMutation<
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
        variableKeys: variableKeys(variables),
      });
      return error;
    }

    const genericError = new GenericError();
    genericError.message = error?.message ?? "Without error message";
    genericError.addContext({
      ...error.context,
      cacheString: props.cacheKey.join("-"),
      variableKeys: variableKeys(variables),
    });

    // Spec 106: the failed mutation is a breadcrumb of the event the boundary captures next.
    addBreadcrumb({
      category: "mutation",
      data: { cacheString: props.cacheKey.join("-"), code: genericError.code },
      level: "error",
      message: `mutation failed`,
    });

    throw genericError;
  }

  return {
    data,
    error: getError(),
    isFetching: status === "pending",
    mutate,
    reset,
    status,
  };
}

// Form values (amounts, descriptions, notes) never reach monitoring: only the names of the fields do (spec 106).
function variableKeys(variables: unknown) {
  return typeof variables === "object" && variables !== null
    ? Object.keys(variables)
    : [];
}

export default useMutation;
