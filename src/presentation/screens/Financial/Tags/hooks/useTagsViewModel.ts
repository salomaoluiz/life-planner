import { useIsFocused } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";

import TagDTO from "@application/dto/financial/TagDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";
import useReadOnlyScope from "@screens/Financial/hooks/useReadOnlyScope";
import {
  ALL_OWNERS,
  archivedOwnerIds,
  buildOwnerFilterChoices,
} from "@screens/Financial/models/ownerOptions";
import { listQueryKey } from "@screens/Financial/models/queryKeys";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import { buildTagRows, tagInActiveScope, tagInScope } from "../models/tagRows";

interface TagsData {
  owners: OwnerDTO[];
  tags: TagDTO[];
}

async function fetchTags(): Promise<TagsData> {
  const owners = await useCases.getOwnersUseCase.execute();
  const tags = await useCases.getFinancialTagsUseCase.execute(
    owners.map((owner) => owner.id),
  );

  return { owners, tags };
}

function useTagsViewModel() {
  const isFocused = useIsFocused();
  const [ownerFilter, setOwnerFilter] = useState(ALL_OWNERS);

  const query = useQuery<TagsData>({
    cacheKey: listQueryKey(useCases.getFinancialTagsUseCase.uniqueName),
    fetch: fetchTags,
  });

  useEffect(() => {
    if (isFocused) {
      query.refetch();
    }
  }, [isFocused]);

  const archivedIds = useMemo(
    () => archivedOwnerIds(query.data?.owners ?? []),
    [query.data],
  );
  const scope = useReadOnlyScope(query.data?.owners, ownerFilter);
  const { openModal } = useModalNavigation();
  const rows = useMemo(
    () =>
      buildTagRows(
        (query.data?.tags ?? []).filter((tag) =>
          ownerFilter === ALL_OWNERS
            ? tagInActiveScope(tag, archivedIds)
            : tagInScope(tag, ownerFilter),
        ),
      ),
    [query.data, ownerFilter, archivedIds],
  );

  return {
    errorMessage: query.error?.message,
    isEmpty: rows.length === 0,
    isLoading: query.isFetching && !query.data,
    isRefreshing: query.isFetching && !!query.data,
    onAddPress: scope.guard(() => openModal("add_new_tag")),
    onOwnerFilterChange: setOwnerFilter,
    onRefresh: async () => query.refetch(),
    onRetry: async () => query.refetch(),
    onRowPress: scope.guard((id: string) => openModal("add_new_tag", { id })),
    onToastHide: scope.onToastHide,
    ownerChoices: buildOwnerFilterChoices(query.data?.owners ?? []),
    ownerFilter,
    readOnly: scope.readOnly,
    rows,
    toastVisible: scope.toastVisible,
  };
}

export { fetchTags };
export default useTagsViewModel;
