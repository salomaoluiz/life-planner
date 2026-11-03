import { useMemo } from "react";

import useOwners from "@presentation/hooks/useOwners";
import { activeOwners } from "@screens/Financial/models/ownerOptions";

// Owners offered when creating a record: archived families are read-only (spec 042). It shares the owners
// cache entry with every other screen (a separate key left stale form fetches without owners) and only
// filters the data.
function useActiveOwners() {
  const query = useOwners();
  const data = useMemo(
    () => (query.data ? activeOwners(query.data) : undefined),
    [query.data],
  );

  return { ...query, data };
}

export default useActiveOwners;
