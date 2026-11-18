import StockDTO, { StockLotDTO } from "@application/dto/stock/StockDTO";
import {
  StockCategoryRef,
  StockExpirationStatus,
  StockLocationRef,
  StockOwners,
  StockUnits,
} from "@domain/entities/stock/StockEntity";

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

  withCategory(category: StockCategoryRef) {
    this.value.category = category;
    this.value.categoryId = category.id;
    return this;
  }

  withCreatedAt(createdAt: Date) {
    this.value.createdAt = createdAt;
    return this;
  }

  withDefault() {
    this.value = {
      barcode: "123456789",
      brand: "Brand Name",
      category: undefined,
      categoryId: undefined,
      createdAt: undefined,
      description: "Product Description",
      expirationStatus: StockExpirationStatus.NONE,
      hasExpiredLot: false,
      hasOpenLot: false,
      id: "12345678-1234-1234-1234-123456789012",
      idealQuantity: undefined,
      location: undefined,
      locationId: undefined,
      lots: [],
      minQuantity: undefined,
      nearestExpiration: undefined,
      needsRestock: false,
      notes: "Some notes about the product",
      openedShelfLifeDays: undefined,
      owner: StockOwners.USER,
      ownerId: "12345678-1234-1234-1234-123456789012",
      quantity: 10,
      quickStep: undefined,
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

  withHasOpenLot(hasOpenLot = true) {
    this.value.hasOpenLot = hasOpenLot;
    return this;
  }

  withId(id: string) {
    this.value.id = id;
    return this;
  }

  withLocation(location: StockLocationRef) {
    this.value.location = location;
    this.value.locationId = location.id;
    return this;
  }

  withLots(lots: StockLotDTO[]) {
    this.value.lots = lots;
    return this;
  }

  withMinQuantity(minQuantity: number, idealQuantity?: number) {
    this.value.minQuantity = minQuantity;
    this.value.idealQuantity = idealQuantity;
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

  withOpenedShelfLifeDays(days: number) {
    this.value.openedShelfLifeDays = days;
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

export default StockDTOFixture;
