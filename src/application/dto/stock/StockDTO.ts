import StockEntity, {
  StockOwners,
  StockUnits,
} from "@domain/entities/stock/StockEntity";

interface IStockDTO {
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

class StockDTO {
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

  constructor(params: IStockDTO) {
    this.brand = params.brand;
    this.barcode = params.barcode;
    this.expirationDate = params.expirationDate;
    this.description = params.description;
    this.id = params.id;
    this.notes = params.notes;
    this.owner = params.owner;
    this.openingDate = params.openingDate;
    this.ownerId = params.ownerId;
    this.purchaseDate = params.purchaseDate;
    this.quantity = params.quantity;
    this.unit = params.unit;
  }

  static fromEntity(entity: StockEntity) {
    return new StockDTO({
      barcode: entity.barcode,
      brand: entity.brand,
      description: entity.description,
      expirationDate: entity.expirationDate,
      id: entity.id,
      notes: entity.notes,
      openingDate: entity.openingDate,
      owner: entity.owner,
      ownerId: entity.ownerId,
      purchaseDate: entity.purchaseDate,
      quantity: entity.quantity,
      unit: entity.unit,
    });
  }
}

export default StockDTO;
