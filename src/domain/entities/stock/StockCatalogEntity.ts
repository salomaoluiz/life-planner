export enum StockCatalogStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

// `GET /stock/locations/:id` (spec 117).
export interface StockLocationDetailEntity {
  color: string;
  icon: string;
  id: string;
  itemCount: number;
  name: string;
  owner: string;
  ownerId: string;
  parentId?: string;
  // "Cozinha / Geladeira" (the API path of spec 125).
  path?: string;
  status: StockCatalogStatus;
}

export interface StockOwnerChangePreviewEntity {
  category: { from?: string; to?: string };
  location: { from?: string; to?: string };
  shoppingList: { from?: string; to?: string };
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
  color: string;
  effectiveFinanceCategoryId?: string;
  financeCategoryId?: string;
  icon: string;
  id: string;
  itemCount: number;
  name: string;
  owner: string;
  ownerId: string;
  parentId?: string;
  status: StockCatalogStatus;
}

interface IStockLocationEntity {
  children: StockLocationEntity[];
  color: string;
  icon: string;
  id: string;
  itemCount: number;
  name: string;
  owner: string;
  ownerId: string;
  parentId?: string;
  status: StockCatalogStatus;
}

// A node of the category tree of one owner.
export class StockCategoryEntity {
  children: StockCategoryEntity[];
  color: string;
  effectiveFinanceCategoryId?: string;
  financeCategoryId?: string;
  icon: string;
  id: string;
  itemCount: number;
  name: string;
  owner: string;
  ownerId: string;
  parentId?: string;
  status: StockCatalogStatus;

  constructor(params: IStockCategoryEntity) {
    this.children = params.children;
    this.color = params.color;
    this.effectiveFinanceCategoryId = params.effectiveFinanceCategoryId;
    this.financeCategoryId = params.financeCategoryId;
    this.icon = params.icon;
    this.id = params.id;
    this.itemCount = params.itemCount;
    this.name = params.name;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.parentId = params.parentId;
    this.status = params.status;
  }
}

// A node of the location tree of one owner (spec 125).
export class StockLocationEntity {
  children: StockLocationEntity[];
  color: string;
  icon: string;
  id: string;
  itemCount: number;
  name: string;
  owner: string;
  ownerId: string;
  parentId?: string;
  status: StockCatalogStatus;

  constructor(params: IStockLocationEntity) {
    this.children = params.children;
    this.color = params.color;
    this.icon = params.icon;
    this.id = params.id;
    this.itemCount = params.itemCount;
    this.name = params.name;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.parentId = params.parentId;
    this.status = params.status;
  }
}
