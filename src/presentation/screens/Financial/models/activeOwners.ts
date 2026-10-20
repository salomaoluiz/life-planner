import { useCases } from "@application/useCases";

import { activeOwners } from "./ownerOptions";

// Owners offered when creating a record: archived families are read-only (spec 042). The cache key differs
// from the full owner list so the filters keep seeing the archived families.
const ACTIVE_OWNERS_CACHE_KEY = [
  useCases.getOwnersUseCase.uniqueName,
  "active",
];

async function fetchActiveOwners() {
  return activeOwners(await useCases.getOwnersUseCase.execute());
}

export { ACTIVE_OWNERS_CACHE_KEY, fetchActiveOwners };
