import TransactionEntity, {
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

class TransactionEntityFixture {
  value = {} as TransactionEntity;

  build() {
    return { ...this.value };
  }

  reset() {
    this.value = {} as TransactionEntity;

    return this;
  }

  withAccountId(accountId: string) {
    this.value.accountId = accountId;

    return this;
  }

  withCategory(category: string) {
    this.value.category = category;

    return this;
  }

  withCategoryId(categoryId: string) {
    this.value.categoryId = categoryId;

    return this;
  }

  withDate(date: Date) {
    this.value.date = date.toISOString();

    return this;
  }

  withDefault() {
    this.value = {
      accountId: "c5598687-dfeb-485e-990a-a035d8e7d23d",
      category: "Shopping",
      categoryId: "7820cfbb-f1aa-4254-8e42-7a0fe1ee981f",
      date: new Date(2025, 5, 5).toISOString(),
      description: "Shopping at the mall",
      id: "d9b513b5-6a02-45b0-9144-397c97a8917f",
      owner: OwnerType.FAMILY,
      ownerId: "b11923e6-bfbb-4965-b3f6-a075249d1e63",
      type: TransactionType.EXPENSE,
      value: "100.00",
    };

    return this;
  }

  withDescription(description: string) {
    this.value.description = description;

    return this;
  }

  withId(id: string) {
    this.value.id = id;

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

  withType(type: TransactionType) {
    this.value.type = type;

    return this;
  }

  withValue(value: string) {
    this.value.value = value;

    return this;
  }
}

export default TransactionEntityFixture;
