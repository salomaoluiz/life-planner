interface IStockModel {
  barcode?: string;
  brand?: string;
  description: string;
  expirationDate?: Date;
  id: string;
  notes?: string;
  openingDate?: Date;
  owner: string;
  ownerId: string;
  purchaseDate?: Date;
  quantity: number;
  unit: string;
}

class StockModel implements IStockModel {
  barcode?: string;
  brand?: string;
  description: string;
  expirationDate?: Date;
  id: string;
  notes?: string;
  openingDate?: Date;
  owner: string;
  ownerId: string;
  purchaseDate?: Date;
  quantity: number;
  unit: string;

  constructor(params: IStockModel) {
    this.barcode = params.barcode;
    this.brand = params.brand;
    this.expirationDate = params.expirationDate;
    this.description = params.description;
    this.id = params.id;
    this.notes = params.notes;
    this.openingDate = params.openingDate;
    this.ownerId = params.ownerId;
    this.owner = params.owner;
    this.purchaseDate = params.purchaseDate;
    this.quantity = params.quantity;
    this.unit = params.unit;
  }

  // API shape (camelCase, ISO strings, `null` for absent optionals). Also what the repository cache stores.
  static fromJSON(data: Record<string, unknown>): StockModel {
    return new StockModel({
      barcode: optionalString(data.barcode),
      brand: optionalString(data.brand),
      description: data.description as string,
      expirationDate: optionalDate(data.expirationDate),
      id: data.id as string,
      notes: optionalString(data.notes),
      openingDate: optionalDate(data.openingDate),
      owner: data.owner as string,
      ownerId: data.ownerId as string,
      purchaseDate: optionalDate(data.purchaseDate),
      quantity: data.quantity as number,
      unit: data.unit as string,
    });
  }

  toJSON() {
    return {
      barcode: this.barcode ?? null,
      brand: this.brand ?? null,
      description: this.description,
      expirationDate: this.expirationDate?.toISOString() ?? null,
      id: this.id,
      notes: this.notes ?? null,
      openingDate: this.openingDate?.toISOString() ?? null,
      owner: this.owner,
      ownerId: this.ownerId,
      purchaseDate: this.purchaseDate?.toISOString() ?? null,
      quantity: this.quantity,
      unit: this.unit,
    };
  }
}

function optionalDate(value: unknown): Date | undefined {
  return typeof value === "string" ? new Date(value) : undefined;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default StockModel;
