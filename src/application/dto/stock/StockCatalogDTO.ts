import {
  StockCatalogStatus,
  StockCategoryEntity,
  StockLocationEntity,
} from "@domain/entities/stock/StockCatalogEntity";

export interface StockOwnerChangePreviewDTO {
  category: { from?: string; to?: string };
  location: { from?: string; to?: string };
  shoppingList: { from?: string; to?: string };
}

export interface StockSuggestionDTO {
  brand?: string;
  description: string;
  id: string;
  quantity: number;
  score: number;
  unit: string;
}

export class StockCategoryDTO {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly status: StockCatalogStatus,
    readonly itemCount: number,
    readonly children: StockCategoryDTO[],
    readonly color: string,
    readonly icon: string,
    readonly owner: string,
    readonly ownerId: string,
    readonly parentId?: string,
    readonly financeCategoryId?: string,
    readonly effectiveFinanceCategoryId?: string,
  ) {}

  static fromEntity(entity: StockCategoryEntity): StockCategoryDTO {
    return new StockCategoryDTO(
      entity.id,
      entity.name,
      entity.status,
      entity.itemCount,
      entity.children.map((child) => StockCategoryDTO.fromEntity(child)),
      entity.color,
      entity.icon,
      entity.owner,
      entity.ownerId,
      entity.parentId,
      entity.financeCategoryId,
      entity.effectiveFinanceCategoryId,
    );
  }
}

export class StockLocationDTO {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly status: StockCatalogStatus,
    readonly itemCount: number,
    readonly children: StockLocationDTO[],
    readonly color: string,
    readonly icon: string,
    readonly owner: string,
    readonly ownerId: string,
    readonly parentId?: string,
  ) {}

  static fromEntity(entity: StockLocationEntity): StockLocationDTO {
    return new StockLocationDTO(
      entity.id,
      entity.name,
      entity.status,
      entity.itemCount,
      entity.children.map((child) => StockLocationDTO.fromEntity(child)),
      entity.color,
      entity.icon,
      entity.owner,
      entity.ownerId,
      entity.parentId,
    );
  }
}
