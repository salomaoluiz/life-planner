import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import CategoryViewModel from "@screens/Financial/Categories/models/CategoryViewModel";

class FinancialCategoriesViewModel {
  sortedCategories: CategoryViewModel[] = [];

  get categories() {
    return this.sortedCategories;
  }


  constructor(dto: CategoryDTO[], ownersDto: OwnerDTO[]) {
    this.sortedCategories = buildSorted(dto, ownersDto);
  }
}

function buildSorted(
  items: CategoryDTO[],
  ownerDtos: OwnerDTO[],
): CategoryViewModel[] {
  const parentMap = new Map<string | undefined, CategoryDTO[]>();
  const ownerMap = new Map<string, OwnerDTO>();

  for (const owner of ownerDtos) {
    ownerMap.set(owner.id, owner);
  }

  for (const item of items) {
    const parentId = item.parentId ?? "root";
    if (!parentMap.has(parentId)) {
      parentMap.set(parentId, []);
    }
    parentMap.get(parentId)!.push(item);
  }

  const result: CategoryViewModel[] = [];

  function deepFirstSearch(parentId: string) {
    const children = parentMap.get(parentId);
    if (!children) return;

    for (const child of children) {
      const owner = ownerMap.get(child.ownerId);
      result.push(new CategoryViewModel(child, owner!));
      deepFirstSearch(child.id);
    }
  }

  deepFirstSearch("root");

  return result;
}
export default FinancialCategoriesViewModel;
