import { BusinessError, GenericError } from "@domain/entities/errors";
import {
  keepPreviousData,
  useReactQuery,
} from "@infrastructure/fetcher/reactQuery";
import { UseQuery } from "@infrastructure/fetcher/types";
import { addBreadcrumb } from "@infrastructure/monitoring";

function definedOptions<T extends Record<string, unknown>>(options: T) {
  return Object.fromEntries(
    Object.entries(options).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

function useQuery<Response>(
  props: Parameters<UseQuery<Response>>[0],
): ReturnType<UseQuery<Response>> {
  const { data, error, isFetching, isPlaceholderData, refetch, status } =
    useReactQuery<Response, BusinessError | GenericError>({
      networkMode: props.networkMode ?? "offlineFirst",
      queryFn: props.fetch,
      queryKey: props.cacheKey,
      // An option passed as `undefined` would override the client defaults (staleTime, retry): only set what was given.
      ...definedOptions({
        enabled: props.enabled,
        placeholderData: props.keepPreviousData ? keepPreviousData : undefined,
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

    // Spec 106: the failed query is a breadcrumb of the event the boundary captures next.
    addBreadcrumb({
      category: "query",
      data: { cacheString: props.cacheKey.join("-"), code: genericError.code },
      level: "error",
      message: `query failed`,
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
    isPlaceholderData,
    refetch: refetchQuery,
    status,
  };
}

export default useQuery;
