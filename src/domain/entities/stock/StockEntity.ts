export enum StockOwners {
  FAMILY = "family",
  USER = "user",
}

export enum StockUnits {
  GRAM = "gram",
  KILOGRAM = "kilogram",
  LITER = "liter",
  MILLILITER = "milliliter",
  UNIT = "unit",
}

interface IStockEntity {
  barcode?: string;
  brand?: string;
  description: string;
  expirationDate?: Date;
  id: string;
  notes?: string;
  openingDate?: Date;
  owner: StockOwners;
  ownerId: string;
  purchaseDate?: Date;
  quantity: number;
  unit: StockUnits;
}

class StockEntity {
  barcode?: string;
  brand?: string;
  description: string;
  expirationDate?: Date;
  id: string;
  notes?: string;
  openingDate?: Date;
  owner: StockOwners;
  ownerId: string;
  purchaseDate?: Date;
  quantity: number;
  unit: StockUnits;

  constructor(params: IStockEntity) {
    this.barcode = params.barcode;
    this.brand = params.brand;
    this.description = params.description;
    this.expirationDate = params.expirationDate;
    this.id = params.id;
    this.notes = params.notes;
    this.openingDate = params.openingDate;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.purchaseDate = params.purchaseDate;
    this.quantity = params.quantity;
    this.unit = params.unit;
  }
}

export default StockEntity;
