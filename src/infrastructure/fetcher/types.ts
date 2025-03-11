import { BusinessError, GenericError } from "@domain/entities/errors";

type NetworkMode = "online" | "offlineFirst" | "always";
// region Query
export type QueryStatus = "pending" | "success" | "error";
type Errors = BusinessError | GenericError | null;

interface QueryProps<R> {
  cacheKey: string[];
  fetch: () => Promise<R>;
  retry?: boolean | number;
  retryDelay?: number;
  /*
  @default "offlineFirst"
   */
  networkMode?: NetworkMode;
}

interface QueryResponse<R = void> {
  refetch: () => Promise<void>;
  data?: R;
  error: Errors;
  isFetching: boolean;
  status: QueryStatus;
}

export type UseQuery<R> = (props: QueryProps<R>) => QueryResponse<R>;

// endregion Query

// region Mutation

export type MutationStatus = "idle" | "pending" | "success" | "error";

interface MutationProps<P, R> {
  cacheKey: string[];
  fetch: (params: P) => Promise<R>;
  /*
    @default false
   */
  retry?: boolean | number;
  retryDelay?: number;
}

interface MutationResponse<P = void, R = void> {
  mutate: (params: P) => void;
  data?: R;
  error: Errors;
  isFetching: boolean;
  status: MutationStatus;
}

export type UseMutation<Params, Response> = (
  props: MutationProps<Params, Response>,
) => MutationResponse<Params, Response>;

// endregion Mutation
