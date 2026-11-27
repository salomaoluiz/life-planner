import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { activityKeys } from "@application/queryKeys/activityKeys";
import { useCases } from "@application/useCases";
import {
  ActivityBatchItemEntity,
  ActivityBatchPageEntity,
} from "@domain/entities/activity/ActivityEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import { useTranslation, useTranslationLocale } from "@presentation/i18n";
import {
  formatDate,
  formatMoney,
  Translate,
} from "@screens/Activity/models/activityRows";
import { targetOfItem } from "@screens/Activity/models/activityTarget";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

export type BatchVM = ReturnType<typeof useBatchViewModel>;

const SEARCH_DEBOUNCE_MS = 350;

export interface BatchItemUI {
  action: ActivityBatchItemEntity["action"];
  amount: string;
  canOpen: boolean;
  key: string;
  label: string;
  meta: string;
}

// Spec 127 FR 11, 12: the items of one batch entry, 50 per page, with a search and the header of the first page.
function useBatchViewModel() {
  const { t } = useTranslation();
  const { getLocale } = useTranslationLocale();
  const languageTag = getLocale().languageTag;
  const params = useLocalSearchParams<{
    assetId?: string;
    file?: string;
    id?: string;
    owner?: string;
    title?: string;
    when?: string;
  }>();
  const id = params.id ?? "";
  const { closeModal, openModal } = useModalNavigation();
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [more, setMore] = useState<{
    cursor: null | string;
    items: ActivityBatchItemEntity[];
  }>({ cursor: null, items: [] });
  const entryExtra = useMemo(
    () => (params.assetId ? { assetId: params.assetId } : undefined),
    [params.assetId],
  );
  const first = useQuery<ActivityBatchPageEntity>({
    cacheKey: activityKeys.items(id, q),
    fetch: async () =>
      useCases.getActivityItemsUseCase.execute({
        id,
        q: q === "" ? undefined : q,
      }),
  });
  const loadMore = useMutation<string, ActivityBatchPageEntity>({
    cacheKey: [useCases.getActivityItemsUseCase.uniqueName, "more"],
    fetch: async (cursor) =>
      useCases.getActivityItemsUseCase.execute({
        cursor,
        id,
        q: q === "" ? undefined : q,
      }),
  });

  useEffect(() => {
    const timer = setTimeout(() => setQ(search.trim()), SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setMore({ cursor: null, items: [] });
  }, [q, first.data]);

  useEffect(() => {
    const page = loadMore.data;

    if (page) {
      setMore((current) => ({
        cursor: page.nextCursor,
        items: [...current.items, ...page.items],
      }));
    }
  }, [loadMore.data]);

  const items = useMemo(
    () => [...(first.data?.items ?? []), ...more.items],
    [first.data, more.items],
  );
  const rows: BatchItemUI[] = items.map((item, index) => ({
    action: item.action,
    amount:
      item.amountCents === null
        ? ""
        : formatMoney(
            item.amountCents,
            item.currency ?? undefined,
            languageTag,
          ),
    canOpen: targetOfItem(item, entryExtra) !== null,
    key: `${item.entityType}-${item.entityId}-${index}`,
    label: item.label,
    meta: [
      item.sourceName,
      item.bookingDate ? formatDate(item.bookingDate, languageTag) : null,
    ]
      .filter(Boolean)
      .join(" · "),
  }));
  const header = first.data?.header ?? null;
  const nextCursor =
    more.items.length > 0 ? more.cursor : (first.data?.nextCursor ?? null);

  function open(index: number) {
    const target = targetOfItem(items[index], entryExtra);

    if (!target) {
      return;
    }

    closeModal();
    // The batch modal is replaced by the item's own screen or modal.
    if ("modal" in target) {
      openModal(target.modal, target.params);
    } else {
      router.push(target.path as never);
    }
  }

  return {
    file: params.file ?? "",
    hasNext: nextCursor !== null,
    header: header && {
      count: header.count,
      dates:
        header.bookingFrom && header.bookingTo
          ? `${formatDate(header.bookingFrom, languageTag)} – ${formatDate(header.bookingTo, languageTag)}`
          : "",
      existing: header.existing,
      sources: header.sources.join(", "),
      total: header.totals
        .map((total) =>
          formatMoney(total.amountCents, total.currency, languageTag),
        )
        .join(" · "),
    },
    isLoading: first.isFetching && !first.data,
    isLoadingMore: loadMore.isFetching,
    onClose: closeModal,
    onLoadMore: () => nextCursor && loadMore.mutate(nextCursor),
    onOpen: open,
    onSearchChange: setSearch,
    owner: params.owner ?? "",
    rows,
    search,
    t: t as Translate,
    title: params.title ?? "",
    when: params.when ?? "",
  };
}

export default useBatchViewModel;
