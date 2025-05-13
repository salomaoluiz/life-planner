import FamilyEntity from "@domain/entities/family/FamilyEntity";

class FamilyEntityFixture {
  value = {} as FamilyEntity;

  build() {
    return { ...this.value };
  }

  reset() {
    this.value = {} as FamilyEntity;
  }

  withDefault() {
    this.value = {
      id: "c6d76166-e7f3-4823-bd5b-f8bbd33912ac",
      name: "Family Name",
      ownerId: "c6d76166-e7f3-4823-bd5b-f8bbd33912ac",
    };
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

  withOwnerId(ownerId: string) {
    this.value.ownerId = ownerId;
    return this;
  }
}

export default FamilyEntityFixture;
