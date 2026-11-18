export enum StockCatalogStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

export interface StockOwnerChangePreviewEntity {
  category: { from?: string; to?: string };
  location: { from?: string; to?: string };
}

export interface StockSuggestionEntity {
  brand?: string;
  description: string;
  id: string;
  quantity: number;
  score: number;
  unit: string;
}

interface IStockCategoryEntity {
  children: StockCategoryEntity[];
  effectiveFinanceCategoryId?: string;
  financeCategoryId?: string;
  id: string;
  itemCount: number;
  name: string;
  parentId?: string;
  status: StockCatalogStatus;
}

interface IStockLocationEntity {
  id: string;
  itemCount: number;
  name: string;
  status: StockCatalogStatus;
}

// A node of the category tree of one owner.
export class StockCategoryEntity {
  children: StockCategoryEntity[];
  effectiveFinanceCategoryId?: string;
  financeCategoryId?: string;
  id: string;
  itemCount: number;
  name: string;
  parentId?: string;
  status: StockCatalogStatus;

  constructor(params: IStockCategoryEntity) {
    this.children = params.children;
    this.effectiveFinanceCategoryId = params.effectiveFinanceCategoryId;
    this.financeCategoryId = params.financeCategoryId;
    this.id = params.id;
    this.itemCount = params.itemCount;
    this.name = params.name;
    this.parentId = params.parentId;
    this.status = params.status;
  }
}

export class StockLocationEntity {
  id: string;
  itemCount: number;
  name: string;
  status: StockCatalogStatus;

  constructor(params: IStockLocationEntity) {
    this.id = params.id;
    this.itemCount = params.itemCount;
    this.name = params.name;
    this.status = params.status;
  }
}
