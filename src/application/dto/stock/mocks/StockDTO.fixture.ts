import StockDTO from "@application/dto/stock/StockDTO";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";

class StockDTOFixture {
  value = {} as StockDTO;

  build() {
    return { ...this.value };
  }

  reset() {
    this.value = {} as StockDTO;
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
      barcode: "123456789",
      brand: "Brand Name",
      description: "Product Description",
      expirationDate: new Date(2025, 1, 1),
      id: "12345678-1234-1234-1234-123456789012",
      notes: "Some notes about the product",
      openingDate: new Date(2023, 1, 1),
      owner: StockOwners.USER,
      ownerId: "12345678-1234-1234-1234-123456789012",
      purchaseDate: new Date(2023, 1, 1),
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

export default StockDTOFixture;
