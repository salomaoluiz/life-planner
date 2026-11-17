import StockEntity, {
  StockExpirationStatus,
  StockOwners,
  StockUnits,
} from "@domain/entities/stock/StockEntity";
import StockLotEntity from "@domain/entities/stock/StockLotEntity";

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
      category: undefined,
      categoryId: undefined,
      description: "Product Description",
      expirationStatus: StockExpirationStatus.NONE,
      hasOpenLot: false,
      id: "c6d76166-e7f3-4823-bd5b-f8bbd33912ac",
      idealQuantity: undefined,
      location: undefined,
      locationId: undefined,
      lots: [],
      minQuantity: undefined,
      nearestExpiration: undefined,
      needsRestock: false,
      notes: undefined,
      openedShelfLifeDays: undefined,
      owner: StockOwners.USER,
      ownerId: "c6d76166-e7f3-4823-bd5b-f8bbd33912ac",
      quantity: 10,
      restockQuantity: 1,
      stockOnly: false,
      unit: StockUnits.UNIT,
      warnDaysClosed: 7,
      warnDaysOpened: 1,
    };
    return this;
  }

  withDescription(description: string) {
    this.value.description = description;
    return this;
  }

  withExpirationStatus(status: StockExpirationStatus) {
    this.value.expirationStatus = status;
    return this;
  }

  withId(id: string) {
    this.value.id = id;
    return this;
  }

  withLots(lots: StockLotEntity[]) {
    this.value.lots = lots;
    return this;
  }

  withNearestExpiration(date: Date) {
    this.value.nearestExpiration = date;
    return this;
  }

  withNeedsRestock(needsRestock = true) {
    this.value.needsRestock = needsRestock;
    return this;
  }

  withNotes(notes: string) {
    this.value.notes = notes;
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
