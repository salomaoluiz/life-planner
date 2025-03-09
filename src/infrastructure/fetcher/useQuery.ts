import { UseQuery } from "@infrastructure/fetcher/types";
import { useReactQuery } from "@infrastructure/fetcher/reactQuery";
import { BusinessError, GenericError } from "@domain/entities/errors";

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
