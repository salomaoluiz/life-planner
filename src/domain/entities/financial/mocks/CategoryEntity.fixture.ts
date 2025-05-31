import CategoryEntity from "@domain/entities/financial/CategoryEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

class CategoryEntityFixture {
  value = {} as CategoryEntity;

  build() {
    return { ...this.value };
  }

  reset() {
    this.value = {} as CategoryEntity;

    return this;
  }

  withDefault() {
    this.value = {
      depthLevel: 0,
      icon: "trash",
      id: "115d1dfe-af17-4f5c-995d-0605498452f5",
      name: "Category Name",
      owner: OwnerType.FAMILY,
      ownerId: "7ce7e370-4acf-4b39-ab62-628d0d62f678",
      parentId: undefined,
    } as CategoryEntity;

    return this;
  }

  withDepthLevel(depthLevel: number) {
    this.value.depthLevel = depthLevel;

    return this;
  }

  withIcon(icon: string) {
    this.value.icon = icon;

    return this;
  }

  withId(id: string) {
    this.value.id = id;

    return this;
  }

  withName(name: string) {
    this.value.name = name;

    return this;
  }

  withOwner(owner: OwnerType) {
    this.value.owner = owner;

    return this;
  }

  withOwnerId(ownerId: string) {
    this.value.ownerId = ownerId;

    return this;
  }

  withParentId(parentId: string) {
    this.value.parentId = parentId;

    return this;
  }
}

export default CategoryEntityFixture;
