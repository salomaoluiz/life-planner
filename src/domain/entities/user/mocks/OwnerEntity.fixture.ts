import OwnerEntity, { OwnerType } from "@domain/entities/user/OwnerEntity";

class OwnerEntityFixture {
  value = {} as OwnerEntity;

  build() {
    return { ...this.value };
  }

  reset() {
    this.value = {} as OwnerEntity;
    return this;
  }

  withDefault() {
    this.value = {
      name: "Owner Name",
      ownerId: "c6d76166-e7f3-4823-bd5b-f8bbd33912ac",
      type: OwnerType.USER,
    };
  }

  withName(name: string) {
    this.value.name = name;
    return this;
  }

  withOwnerId(ownerId: string) {
    this.value.ownerId = ownerId;
    return this;
  }

  withType(type: OwnerType) {
    this.value.type = type;
    return this;
  }
}

export default OwnerEntityFixture;
