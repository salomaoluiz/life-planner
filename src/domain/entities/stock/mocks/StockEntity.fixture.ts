import StockEntity, {
  StockOwners,
  StockUnits,
} from "@domain/entities/stock/StockEntity";

class StockEntityFixture {
  value = {} as StockEntity;

  build() {
    return { ...this.value };
  }

  reset() {
    this.value = {} as StockEntity;
    return this;
  }

  withBarcode(barcode: string) {
    this.value.barcode = barcode;
    return this;
  }

  withBrand(brand: string) {
    this.value.brand = brand;
    return this;
  }

  withDefault() {
    this.value = {
      barcode: undefined,
      brand: undefined,
      description: "Product Description",
      expirationDate: undefined,
      id: "c6d76166-e7f3-4823-bd5b-f8bbd33912ac",
      notes: undefined,
      openingDate: undefined,
      owner: StockOwners.USER,
      ownerId: "c6d76166-e7f3-4823-bd5b-f8bbd33912ac",
      purchaseDate: undefined,
      quantity: 10,
      unit: StockUnits.UNIT,
    };
    return this;
  }

  withDescription(description: string) {
    this.value.description = description;
    return this;
  }

  withExpirationDate(expirationDate: Date) {
    this.value.expirationDate = expirationDate;
    return this;
  }

  withId(id: string) {
    this.value.id = id;
    return this;
  }

  withNotes(notes: string) {
    this.value.notes = notes;
    return this;
  }

  withOpeningDate(openingDate: Date) {
    this.value.openingDate = openingDate;
    return this;
  }

  withOwner(owner: StockOwners) {
    this.value.owner = owner;
    return this;
  }

  withOwnerId(ownerId: string) {
    this.value.ownerId = ownerId;
    return this;
  }

  withPurchaseDate(purchaseDate: Date) {
    this.value.purchaseDate = purchaseDate;
    return this;
  }

  withQuantity(quantity: number) {
    this.value.quantity = quantity;
    return this;
  }

  withUnit(unit: StockUnits) {
    this.value.unit = unit;
    return this;
  }
}

export default StockEntityFixture;
