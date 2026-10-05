import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

import { TranslationKeys } from "@presentation/i18n/types";
import {
  expandNewFamilies,
  ExpansionState,
  isExpanded,
} from "@screens/Family/utils/expansion";
import sortFamilies from "@screens/Family/utils/sortFamilies";

import useFamilies from "./useFamilies";

function useFamilyViewModel() {
  const { error, families, isFetching, refetch } = useFamilies();
  const [expansion, setExpansion] = useState<ExpansionState>({});
  const seenIds = useRef<string[]>([]);

  const sorted = useMemo(() => sortFamilies(families ?? []), [families]);

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
    sorted.length === 1
      ? "family.list.subtitle_one"
      : "family.list.subtitle_other";

  return {
    count: sorted.length,
    families: sorted,
    isExpanded: (id: string) => isExpanded(expansion, id, sorted[0]?.familyId),
    onNewFamily: () => router.push("/family/add_new_family" as never),
    onRefresh: async () => refetch(),
    onRetry: async () => refetch(),
    onToggle: (id: string) =>
      setExpansion((state) => ({
        ...state,
        [id]: !isExpanded(state, id, sorted[0]?.familyId),
      })),
    refreshing: !!families && isFetching,
    status: getStatus(),
    subtitleKey,
  };
}

export default useFamilyViewModel;
