import { BusinessError, GenericError } from "@domain/entities/errors";

export type MutationStatus = "error" | "idle" | "pending" | "success";
// region Query
export type QueryStatus = "error" | "pending" | "success";
export type UseMutation<Params, Response> = (
  props: MutationProps<Params, Response>,
) => MutationResponse<Params, Response>;

export type UseQuery<R> = (props: QueryProps<R>) => QueryResponse<R>;

type Errors = BusinessError | GenericError | null;

interface MutationProps<P, R> {
  cacheKey: string[];
  fetch: (params: P) => Promise<R>;
  /*
    @default false
   */
  retry?: boolean | number;
  retryDelay?: number;
}

// endregion Query

// region Mutation

interface MutationResponse<P = void, R = void> {
  data?: R;
  error: Errors;
  isFetching: boolean;
  mutate: (params: P) => void;
  // Back to idle, so the next success is detected again
  reset: () => void;
  status: MutationStatus;
}

type NetworkMode = "always" | "offlineFirst" | "online";

interface QueryProps<R> {
  cacheKey: string[];
  enabled?: boolean;
  fetch: () => Promise<R>;
  /** Another cache key keeps showing the previous key's data (flagged `isPlaceholderData`) until its own arrives. */
  keepPreviousData?: boolean;
  /*
  @default "offlineFirst"
   */
  networkMode?: NetworkMode;
  /** Milliseconds between automatic refetches while mounted. */
  refetchInterval?: number;
  retry?: boolean | number;
  retryDelay?: number;
  /** Milliseconds a result counts as fresh (no refetch on mount inside it). @default 30s (client default) */
  staleTime?: number;
}

interface QueryResponse<R = void> {
  data?: R;
  error: Errors;
  isFetching: boolean;
  /** The data is the previous key's (see `keepPreviousData`), not this key's own. */
  isPlaceholderData?: boolean;
  refetch: (options?: { throwOnError?: boolean }) => Promise<void>;
  status: QueryStatus;
}

// endregion Mutation
