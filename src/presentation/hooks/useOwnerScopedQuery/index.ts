import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useQuery } from "@infrastructure/fetcher";
import useOwners from "@presentation/hooks/useOwners";

interface Props<R> {
  cacheKey: string[];
  enabled?: boolean;
  fetch: (owners: OwnerDTO[]) => Promise<R>;
  // Spec 075: another key (a month) shows the previous key's data, flagged `isPlaceholderData`, until its own arrives.
  keepPreviousData?: boolean;
}

// A query that needs the owners of the user (spec 074): it starts in the same render the shared owners query
// resolves (one parallel batch for every screen query), is keyed by the owner ids (a family change refetches it),
// and surfaces an owners failure instead of staying disabled forever.
function useOwnerScopedQuery<R>(props: Props<R>) {
  const owners = useOwners();
  const ownerList = owners.data;
  const query = useQuery<R>({
    cacheKey: [
      ...props.cacheKey,
      ...(ownerList ?? []).map((owner) => owner.id),
    ],
    enabled: !!ownerList && props.enabled !== false,
    fetch: async () => props.fetch(ownerList as OwnerDTO[]),
    keepPreviousData: props.keepPreviousData,
  });

  async function refetch(options?: { throwOnError?: boolean }) {
    if (!ownerList) {
      return owners.refetch(options);
    }
    await Promise.all([owners.refetch(options), query.refetch(options)]);
  }

  return {
    ...query,
    error: query.error ?? (ownerList ? null : owners.error),
    isFetching: query.isFetching || owners.isFetching,
    refetch,
    status: !ownerList && owners.error ? ("error" as const) : query.status,
  };
}

export default useOwnerScopedQuery;
