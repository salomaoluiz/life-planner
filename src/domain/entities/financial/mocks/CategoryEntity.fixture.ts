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
      icon: "icon",
      id: "id",
      name: "name",
      owner: OwnerType.FAMILY,
      ownerId: "ownerId",
      parentId: "parentId",
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
