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
  status: MutationStatus;
}

type NetworkMode = "always" | "offlineFirst" | "online";

interface QueryProps<R> {
  cacheKey: string[];
  enabled?: boolean;
  fetch: () => Promise<R>;
  /*
  @default "offlineFirst"
   */
  networkMode?: NetworkMode;
  retry?: boolean | number;
  retryDelay?: number;
}

interface QueryResponse<R = void> {
  data?: R;
  error: Errors;
  isFetching: boolean;
  refetch: () => Promise<void>;
  status: QueryStatus;
}

// endregion Mutation
