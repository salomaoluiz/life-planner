import { useEffect, useMemo, useRef, useState } from "react";

import { TranslationKeys } from "@presentation/i18n/types";
import {
  expandNewFamilies,
  ExpansionState,
  isExpanded,
} from "@screens/Family/utils/expansion";
import sortFamilies from "@screens/Family/utils/sortFamilies";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import useFamilies from "./useFamilies";

function useFamilyViewModel() {
  const { openModal } = useModalNavigation();
  const { error, families, isFetching, refetch } = useFamilies();
  const [expansion, setExpansion] = useState<ExpansionState>({});
  const seenIds = useRef<string[]>([]);

  const sorted = useMemo(() => sortFamilies(families ?? []), [families]);
  const active = useMemo(
    () => sorted.filter((family) => !family.isArchived),
    [sorted],
  );
  const archived = useMemo(
    () => sorted.filter((family) => family.isArchived),
    [sorted],
  );
  const [archivedExpanded, setArchivedExpanded] = useState(false);

  useEffect(() => {
    const ids = sorted.map((family) => family.familyId);
    setExpansion((state) => expandNewFamilies(state, seenIds.current, ids));
    seenIds.current = ids;
  }, [sorted]);

  function getStatus() {
    if (!families) {
      return error ? ("error" as const) : ("loading" as const);
    }

    return families.length === 0 ? ("empty" as const) : ("ready" as const);
  }

  const subtitleKey: TranslationKeys =
    active.length === 1
      ? "family.list.subtitle_one"
      : "family.list.subtitle_other";

  return {
    archivedExpanded,
    archivedFamilies: archived,
    count: active.length,
    families: active,
    isExpanded: (id: string) => isExpanded(expansion, id, active[0]?.familyId),
    onArchivedToggle: () => setArchivedExpanded((expanded) => !expanded),
    onNewFamily: () => openModal("add_new_family"),
    onRefresh: async () => refetch(),
    onRetry: async () => refetch(),
    onToggle: (id: string) =>
      setExpansion((state) => ({
        ...state,
        [id]: !isExpanded(state, id, active[0]?.familyId),
      })),
    refreshing: !!families && isFetching,
    status: getStatus(),
    subtitleKey,
  };
}

export default useFamilyViewModel;
