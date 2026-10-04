import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";

class NewCategoryViewModel {
  get stockOwners() {
    return this.owners.map((owner) => ({
      label: `${owner.type.toUpperCase()} - ${owner.name}`,
      value: owner.id,
    }));
  }

  constructor(
    private readonly owners: OwnerDTO[],
    private readonly categories: CategoryDTO[],
  ) {}

  getParentCategories(ownerId: string | undefined, type: string) {
    const targetOwnerId = ownerId ?? this.owners[0]?.id;
    const filtered = this.categories.filter(
      (c) => c.ownerId === targetOwnerId && c.type === type,
    );

    return [
      { label: "None (Root Category)", value: "" },
      ...filtered.map((c) => ({
        label: c.name,
        value: c.id,
      })),
    ];
  }
}

export default NewCategoryViewModel;
