import { BusinessError, GenericError } from "@domain/entities/errors";
import { useReactQuery } from "@infrastructure/fetcher/reactQuery";
import { UseQuery } from "@infrastructure/fetcher/types";

function definedOptions<T extends Record<string, unknown>>(options: T) {
  return Object.fromEntries(
    Object.entries(options).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

function useQuery<Response>(
  props: Parameters<UseQuery<Response>>[0],
): ReturnType<UseQuery<Response>> {
  const { data, error, isFetching, refetch, status } = useReactQuery<
    Response,
    BusinessError | GenericError
  >({
    networkMode: props.networkMode ?? "offlineFirst",
    queryFn: props.fetch,
    queryKey: props.cacheKey,
    // An option passed as `undefined` would override the client defaults (staleTime, retry): only set what was given.
    ...definedOptions({
      enabled: props.enabled,
      refetchInterval: props.refetchInterval,
      retry: props.retry,
      retryDelay: props.retryDelay,
      staleTime: props.staleTime,
    }),
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
    genericError.message = error?.message ?? "Without error message";
    genericError.addContext({
      ...error.context,
      cacheString: props.cacheKey.join("-"),
    });

    throw genericError;
  }

  // Joins a fetch that is already running instead of cancelling it and sending the same request again.
  async function refetchQuery(options?: { throwOnError?: boolean }) {
    await refetch({ cancelRefetch: false, ...options });
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
