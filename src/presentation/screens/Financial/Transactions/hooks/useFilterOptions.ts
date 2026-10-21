import { useMemo } from "react";

import AccountDTO from "@application/dto/financial/AccountDTO";
import CategoryDTO from "@application/dto/financial/CategoryDTO";
import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import TagDTO from "@application/dto/financial/TagDTO";
import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";

import { PickerCategory } from "../models/categoryPicker";

export interface SourceOption {
  archived: boolean;
  id: string;
  kind: "ACCOUNT" | "CARD";
  name: string;
  // The owner (Personal or a family) the account or card belongs to.
  ownerId: string;
}

// What the Filters modal and the active-filter chips need to name an id (spec 045 FR 11, 18): accounts,
// cards, categories and tags of the owners. They share the cache keys of the transaction form.
function useFilterOptions(ownerIds: string[], enabled: boolean) {
  const on = enabled && ownerIds.length > 0;
  const accounts = useQuery<AccountDTO[]>({
    cacheKey: [useCases.getFinancialAccountsUseCase.uniqueName],
    enabled: on,
    fetch: async () => useCases.getFinancialAccountsUseCase.execute(ownerIds),
  });
  const cards = useQuery<CreditCardDTO[]>({
    cacheKey: [useCases.getFinancialCreditCardsUseCase.uniqueName],
    enabled: on,
    fetch: async () =>
      useCases.getFinancialCreditCardsUseCase.execute(ownerIds),
  });
  const categories = useQuery<CategoryDTO[]>({
    cacheKey: [useCases.getFinancialCategoriesUseCase.uniqueName],
    enabled: on,
    fetch: async () => useCases.getFinancialCategoriesUseCase.execute(ownerIds),
  });
  const tags = useQuery<TagDTO[]>({
    cacheKey: [useCases.getFinancialTagsUseCase.uniqueName],
    enabled: on,
    fetch: async () => useCases.getFinancialTagsUseCase.execute(ownerIds),
  });

  return useMemo(
    () => ({
      categories: (categories.data ?? []).map(
        (category): PickerCategory => ({
          archived: category.status === "ARCHIVED",
          id: category.id,
          name: category.name,
          parentId: category.parentId,
          type: category.type,
        }),
      ),
      categoryDtos: categories.data ?? [],
      sources: [
        ...(accounts.data ?? []).map(
          (account): SourceOption => ({
            archived: account.status === "ARCHIVED",
            id: account.id,
            kind: "ACCOUNT",
            name: account.name,
            ownerId: account.ownerId,
          }),
        ),
        ...(cards.data ?? []).map(
          (card): SourceOption => ({
            archived: card.status === "ARCHIVED",
            id: card.id,
            kind: "CARD",
            name: card.title,
            ownerId: card.ownerId,
          }),
        ),
      ],
      tags: tags.data ?? [],
    }),
    [accounts.data, cards.data, categories.data, tags.data],
  );
}

export default useFilterOptions;
