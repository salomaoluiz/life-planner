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
  status: string;
  unit: string;
}

// TODO: Refactor to remove the status and take account the Owner and Unit enums

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
  status: string;
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
    this.status = params.status;
  }

  static fromJSON(data: Record<string, unknown>): StockModel {
    return new StockModel({
      barcode: data.barcode as string,
      brand: data.brand as string,
      description: data.description as string,
      expirationDate: data.expiration_date
        ? new Date(data.expiration_date as string)
        : undefined,
      id: data.id as string,
      notes: data.notes as string,
      openingDate: data.opening_date
        ? new Date(data.opening_date as string)
        : undefined,
      owner: data.owner as string,
      ownerId: data.owner_id as string,
      purchaseDate: data.purchase_date
        ? new Date(data.purchase_date as string)
        : undefined,
      quantity: data.quantity as number,
      status: data.status as string,
      unit: data.unit as string,
    });
  }

  toJSON() {
    return {
      barcode: this.barcode,
      brand: this.brand,
      description: this.description,
      expiration_date: this.expirationDate
        ? this.expirationDate.toISOString()
        : null,
      id: this.id,
      notes: this.notes,
      opening_date: this.openingDate ? this.openingDate.toISOString() : null,
      owner: this.owner,
      owner_id: this.ownerId,
      purchase_date: this.purchaseDate ? this.purchaseDate.toISOString() : null,
      quantity: this.quantity,
      status: this.status,
      unit: this.unit,
    };
  }
}

export default StockModel;
