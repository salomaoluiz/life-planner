import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";

class FinancialCategoryViewModel {
  get depthLevel() {
    return this.dto.depthLevel ?? 0;
  }

  get icon() {
    return this.dto.icon;
  }

  get id() {
    return this.dto.id;
  }

  get name() {
    return this.dto.name;
  }

  get ownerId() {
    return this.dto.ownerId;
  }

  get ownerName() {
    const owner = this.owners.find((o) => o.id === this.dto.ownerId);
    const typeLabel = this.dto.owner === "FAMILY" ? "Family" : "Personal";
    return owner ? `${owner.name} (${typeLabel})` : typeLabel;
  }

  get parentId() {
    return this.dto.parentId;
  }

  constructor(
    private readonly dto: CategoryDTO,
    private readonly owners: OwnerDTO[],
  ) {}

  static buildHierarchy(
    categories: FinancialCategoryViewModel[],
  ): FinancialCategoryViewModel[] {
    const roots = categories.filter((c) => !c.parentId);
    const result: FinancialCategoryViewModel[] = [];
    function visit(node: FinancialCategoryViewModel) {
      result.push(node);
      const children = categories.filter((c) => c.parentId === node.id);
      children.forEach(visit);
    }
    roots.forEach(visit);
    // Add orphan nodes if any
    const visitedIds = new Set(result.map((c) => c.id));
    categories.forEach((c) => {
      if (!visitedIds.has(c.id)) {
        result.push(c);
      }
    });
    return result;
  }
}

export default FinancialCategoryViewModel;
