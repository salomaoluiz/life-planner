import { useMemo } from "react";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";

import { ImportRecords } from "../models/importValues";
import useFilterOptions from "./useFilterOptions";

// `Parent > Child` of a category (spec 047 FR 23-24).
function categoryPath(category: CategoryDTO, byId: Map<string, CategoryDTO>) {
  const names = [category.name];
  let parent = category.parentId ? byId.get(category.parentId) : undefined;

  while (parent) {
    names.unshift(parent.name);
    parent = parent.parentId ? byId.get(parent.parentId) : undefined;
  }

  return names.join(" > ");
}

// The accounts, cards and categories the values of the file can be matched to (spec 047 FR 23), per owner: the ones that
// are still active. The queries are the ones of the transaction form (they share the cache).
function useImportRecords(owners: OwnerDTO[]) {
  const allOwnerIds = useMemo(() => owners.map((owner) => owner.id), [owners]);
  const options = useFilterOptions(allOwnerIds, true);

  return useMemo<Record<string, ImportRecords>>(() => {
    const byId = new Map(options.categoryDtos.map((item) => [item.id, item]));

    return Object.fromEntries(
      allOwnerIds.map((ownerId) => [
        ownerId,
        {
          accounts: options.sources
            .filter(
              (source) =>
                source.kind === "ACCOUNT" &&
                !source.archived &&
                source.ownerId === ownerId,
            )
            .map((source) => ({
              currency: source.currency,
              id: source.id,
              name: source.name,
            })),
          cards: options.sources
            .filter(
              (source) =>
                source.kind === "CARD" &&
                !source.archived &&
                source.ownerId === ownerId,
            )
            .map((source) => ({
              closingDay: source.closingDay,
              currency: source.currency,
              id: source.id,
              name: source.name,
            })),
          categories: options.categoryDtos
            .filter(
              (item) =>
                item.status !== "ARCHIVED" &&
                item.scopeOwnerIds.includes(ownerId),
            )
            .map((item) => ({
              depthLevel: item.depthLevel ?? 0,
              id: item.id,
              name: item.name,
              path: categoryPath(item, byId),
              scope: item.scope,
              type: item.type as "EXPENSE" | "INCOME",
            })),
        },
      ]),
    );
  }, [options, allOwnerIds]);
}

export { categoryPath };
export default useImportRecords;
