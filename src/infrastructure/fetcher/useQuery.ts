import { BusinessError, GenericError } from "@domain/entities/errors";
import { useReactQuery } from "@infrastructure/fetcher/reactQuery";
import { UseQuery } from "@infrastructure/fetcher/types";

function useQuery<Response>(
  props: Parameters<UseQuery<Response>>[0],
): ReturnType<UseQuery<Response>> {
  const { data, error, isFetching, refetch, status } = useReactQuery<
    Response,
    BusinessError | GenericError
  >({
    networkMode: props.networkMode || "offlineFirst",
    queryFn: props.fetch,
    queryKey: props.cacheKey,
    retry: props.retry,
    retryDelay: props.retryDelay,
  });

  function getError() {
    if (!error) {
      return null;
    }

    if (error instanceof BusinessError) {
      error.addContext({
        cacheString: props.cacheKey.join("-"),
      });

      return error;
    }

    const genericError = new GenericError();
    genericError.message = error?.message || "Without error message";
    genericError.addContext({
      ...error.context,
      cacheString: props.cacheKey.join("-"),
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
