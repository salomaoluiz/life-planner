import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { useCases } from "@application/useCases";
import {
  PurchaseEntity,
  PurchaseViewEntity,
} from "@domain/entities/stock/PurchaseEntity";
import { invalidateFetcherData, useQuery } from "@infrastructure/fetcher";
import { uuidv4 } from "@infrastructure/uuid";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

export type StartPurchaseVM = ReturnType<typeof useStartPurchaseViewModel>;

const NEW_MARKET = "__new__";

// The local calendar day: the purchase date defaults to today (FR 32).
export function todayIso(now = new Date()) {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

export default useStartPurchaseViewModel;

function useStartPurchaseViewModel() {
  const { closeModal } = useModalNavigation();
  const { id: listId } = useLocalSearchParams<{ id: string }>();
  const [marketId, setMarketId] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const detail = useQuery({
    cacheKey: [useCases.getShoppingListUseCase.uniqueName, listId ?? ""],
    enabled: !!listId,
    fetch: async () => useCases.getShoppingListUseCase.execute({ id: listId }),
  });
  const list = detail.data?.list;
  const markets = useQuery({
    cacheKey: [useCases.getMarketsUseCase.uniqueName, list?.ownerId ?? ""],
    enabled: !!list,
    fetch: async () =>
      useCases.getMarketsUseCase.execute({ ownerId: list?.ownerId }),
  });
  const purchases = useQuery({
    cacheKey: [useCases.getListPurchasesUseCase.uniqueName, listId ?? ""],
    enabled: !!listId,
    fetch: async () => useCases.getListPurchasesUseCase.execute({ listId }),
  });

  const marketOptions = (markets.data ?? []).filter(
    (market) => market.ownerId === list?.ownerId,
  );
  const open = (purchases.data?.items ?? []).filter(
    (item): item is PurchaseViewEntity => "purchase" in item,
  );
  const selectedMarketId =
    marketId ?? list?.defaultMarketId ?? marketOptions[0]?.id ?? NEW_MARKET;
  const creatingMarket = selectedMarketId === NEW_MARKET;
  const marketNames = new Map(
    marketOptions.map((market) => [market.id, market.name]),
  );

  async function onStart() {
    if (!list || saving || (creatingMarket && name.trim().length === 0)) {
      return;
    }

    setSaving(true);
    setFailed(false);

    try {
      let chosen = selectedMarketId;

      if (creatingMarket) {
        const created = await useCases.createMarketUseCase.execute({
          name: name.trim(),
          neighborhood: neighborhood.trim() || undefined,
          owner: list.owner,
          ownerId: list.ownerId,
        });

        chosen = created.id;
      }

      const purchase = await useCases.startPurchaseUseCase.execute({
        id: uuidv4(),
        listId,
        marketId: chosen,
        purchaseDate: todayIso(),
      });

      await invalidateFetcherData();
      open_(purchase);
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  function open_(purchase: Pick<PurchaseEntity, "id">) {
    closeModal();
    router.push(`/stock/purchases/${purchase.id}` as never);
  }

  return {
    creatingMarket,
    failed,
    isLoading: detail.isFetching && !detail.data,
    listName: list?.name ?? "",
    marketOptions: [
      ...marketOptions.map((market) => ({
        label: market.neighborhood
          ? `${market.name} · ${market.neighborhood}`
          : market.name,
        value: market.id,
      })),
      { label: "+", value: NEW_MARKET },
    ],
    name,
    neighborhood,
    onClose: closeModal,
    onJoin: (purchase: PurchaseEntity) => open_(purchase),
    onMarketChange: setMarketId,
    onNameChange: setName,
    onNeighborhoodChange: setNeighborhood,
    onStart,
    open: open.map((view) => ({
      cartCount: view.cart.count,
      id: view.purchase.id,
      marketName: marketNames.get(view.purchase.marketId) ?? "",
      purchase: view.purchase,
      startedBy: view.rows[0]?.checkedBy?.name ?? "",
    })),
    saving,
    selectedMarketId,
  };
}
