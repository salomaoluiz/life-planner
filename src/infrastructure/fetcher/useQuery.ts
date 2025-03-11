import { UseQuery } from "@infrastructure/fetcher/types";
import { useReactQuery } from "@infrastructure/fetcher/reactQuery";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { captureException } from "@infrastructure/monitoring";

function useQuery<Response>(
  props: Parameters<UseQuery<Response>>[0],
): ReturnType<UseQuery<Response>> {
  const { data, error, isFetching, refetch, status } = useReactQuery<
    Response,
    BusinessError | GenericError
  >({
    queryKey: props.cacheKey,
    queryFn: props.fetch,
    retry: props.retry,
    retryDelay: props.retryDelay,
    networkMode: props.networkMode || "offlineFirst",
  });

  function getError() {
    if (!error) {
      return null;
    }

    if (error instanceof BusinessError) {
      error.addContext({
        cacheKey: props.cacheKey.join("-"),
      });

      return error;
    }

    const genericError = new GenericError();
    genericError.message = error?.message || "Without error message";
    genericError.addContext({
      cacheKey: props.cacheKey.join("-"),
    });

    captureException({
      name: "useQuery-failure",
      cause: genericError,
      message: genericError.message,
      stack: genericError?.stack,
    });

    throw genericError;
  }

  async function refetchQuery() {
    await refetch();
  }

  return {
    data,
    error: getError(),
    isFetching,
    refetch: refetchQuery,
    status,
  };
}

export default useQuery;
