import { useEffect } from "react";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";
import { CatalogNode } from "@screens/Stock/Catalog/models/catalogEntries";
import {
  findNode,
  moveTargets,
} from "@screens/Stock/Catalog/models/catalogParents";

import CatalogDeleteSheet from "../CatalogDeleteSheet";

interface Props {
  categories: CatalogNode[];
  id: string;
  kind: "category" | "location";
  locations: CatalogNode[];
  onClose: () => void;
  onDeleted: () => void;
}

// Spec 125 FR 20-23: the delete of a category or location, moving its items when something uses it.
function CatalogDelete(props: Props) {
  const nodes = props.kind === "category" ? props.categories : props.locations;
  const node = findNode(nodes, props.id);
  const remove = useMutation({
    cacheKey: [useCases.deleteStockCategoryUseCase.uniqueName, "catalog"],
    fetch: async (params: { moveTo?: string }) =>
      props.kind === "category"
        ? useCases.deleteStockCategoryUseCase.execute({
            id: props.id,
            moveTo: params.moveTo,
          })
        : useCases.deleteStockLocationUseCase.execute({
            id: props.id,
            moveTo: params.moveTo,
          }),
  });

  useEffect(() => {
    if (remove.status === "success") {
      remove.reset();
      props.onDeleted();
    }
  }, [remove.status]);

  if (!node) {
    return null;
  }

  return (
    <CatalogDeleteSheet
      busy={remove.isFetching}
      hasChildren={node.children.length > 0}
      itemCount={node.itemCount}
      kind={props.kind}
      name={node.name}
      onCancel={props.onClose}
      onConfirm={(moveTo) => remove.mutate({ moveTo })}
      parentId={node.parentId}
      targets={moveTargets(nodes, node.ownerId, node)}
    />
  );
}

export default CatalogDelete;
