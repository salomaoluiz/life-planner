import StockEntity from "@domain/entities/stock/StockEntity";

export interface AiUsageEntity {
  light: { limit: number; used: number };
  search: { limit: number; used: number };
}

export interface ItemSuggestionEntity {
  fields: ItemSuggestionFields;
  notice?: ItemSuggestionNotice;
  sources: Partial<Record<keyof ItemSuggestionFields, ItemSuggestionSource>>;
  usage: AiUsageEntity;
}

export interface ItemSuggestionFields {
  brand?: string;
  categoryId?: string;
  description?: string;
  locationId?: string;
  openedShelfLifeDays?: number;
  packageQuantity?: number;
  unit?: string;
}
export type ItemSuggestionNotice =
  | "AI_NOT_SURE"
  | "AI_UNAVAILABLE"
  | "LIMIT_REACHED"
  | "NOT_FOUND";

export type ItemSuggestionSource = "AI" | "OPEN_FOOD_FACTS";

export interface StockBarcodeLookupEntity {
  code: string;
  matches: StockBarcodeMatchEntity[];
}

// Spec 121 FR 8: one match of a scanned code, in an owner the user can read.
export interface StockBarcodeMatchEntity {
  item: StockEntity;
  owner: string;
  ownerId: string;
  ownerName: string;
  // Archived family: the quick sheet shows no movement actions (spec 042).
  readOnly: boolean;
}
