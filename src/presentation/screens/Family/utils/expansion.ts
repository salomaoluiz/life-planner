export type ExpansionState = Record<string, boolean>;

// Families that appear after the first load (just created) start expanded.
function expandNewFamilies(
  state: ExpansionState,
  seenIds: string[],
  currentIds: string[],
): ExpansionState {
  if (seenIds.length === 0) {
    return state;
  }

  const added = currentIds.filter((id) => !seenIds.includes(id));

  if (added.length === 0) {
    return state;
  }

  return { ...state, ...Object.fromEntries(added.map((id) => [id, true])) };
}

function isExpanded(
  state: ExpansionState,
  familyId: string,
  firstId: string | undefined,
) {
  return state[familyId] ?? familyId === firstId;
}

export { expandNewFamilies, isExpanded };
