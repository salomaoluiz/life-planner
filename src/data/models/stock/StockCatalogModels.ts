const DEFAULT_COLOR = "#8A8F98";
const DEFAULT_ICON = "package-variant";

export class StockCategoryModel {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly status: string,
    readonly itemCount: number,
    readonly children: StockCategoryModel[],
    readonly color: string,
    readonly icon: string,
    readonly owner: string,
    readonly ownerId: string,
    readonly parentId?: string,
    readonly financeCategoryId?: string,
    readonly effectiveFinanceCategoryId?: string,
  ) {}

  static fromJSON(data: Record<string, unknown>): StockCategoryModel {
    return new StockCategoryModel(
      data.id as string,
      data.name as string,
      data.status as string,
      (data.itemCount as number | undefined) ?? 0,
      ((data.children as Record<string, unknown>[] | undefined) ?? []).map(
        (child) => StockCategoryModel.fromJSON(child),
      ),
      stringOr(data.color, DEFAULT_COLOR),
      stringOr(data.icon, DEFAULT_ICON),
      stringOr(data.owner, "USER"),
      stringOr(data.ownerId, ""),
      optionalString(data.parentId),
      optionalString(data.financeCategoryId),
      optionalString(data.effectiveFinanceCategoryId),
    );
  }
}

// `GET /stock/locations/:id` (spec 117): the QR route header.
export class StockLocationDetailModel {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly status: string,
    readonly itemCount: number,
    readonly owner: string,
    readonly ownerId: string,
    readonly color: string,
    readonly icon: string,
    readonly parentId?: string,
    readonly path?: string,
  ) {}

  static fromJSON(data: Record<string, unknown>): StockLocationDetailModel {
    return new StockLocationDetailModel(
      data.id as string,
      data.name as string,
      data.status as string,
      (data.itemCount as number | undefined) ?? 0,
      data.owner as string,
      data.ownerId as string,
      stringOr(data.color, DEFAULT_COLOR),
      stringOr(data.icon, DEFAULT_ICON),
      optionalString(data.parentId),
      optionalString(data.path),
    );
  }
}

// A node of the location tree (spec 125).
export class StockLocationModel {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly status: string,
    readonly itemCount: number,
    readonly children: StockLocationModel[],
    readonly color: string,
    readonly icon: string,
    readonly owner: string,
    readonly ownerId: string,
    readonly parentId?: string,
  ) {}

  static fromJSON(data: Record<string, unknown>): StockLocationModel {
    return new StockLocationModel(
      data.id as string,
      data.name as string,
      data.status as string,
      (data.itemCount as number | undefined) ?? 0,
      ((data.children as Record<string, unknown>[] | undefined) ?? []).map(
        (child) => StockLocationModel.fromJSON(child),
      ),
      stringOr(data.color, DEFAULT_COLOR),
      stringOr(data.icon, DEFAULT_ICON),
      stringOr(data.owner, "USER"),
      stringOr(data.ownerId, ""),
      optionalString(data.parentId),
    );
  }
}

export class StockOwnerChangePreviewModel {
  constructor(
    readonly category: { from?: string; to?: string },
    readonly location: { from?: string; to?: string },
    readonly shoppingList: { from?: string; to?: string },
  ) {}

  static fromJSON(data: Record<string, unknown>): StockOwnerChangePreviewModel {
    function side(value: unknown) {
      const raw = (value ?? {}) as Record<string, unknown>;

      return { from: optionalString(raw.from), to: optionalString(raw.to) };
    }

    return new StockOwnerChangePreviewModel(
      side(data.category),
      side(data.location),
      side(data.shoppingList),
    );
  }
}

export class StockSuggestionModel {
  constructor(
    readonly id: string,
    readonly description: string,
    readonly unit: string,
    readonly quantity: number,
    readonly score: number,
    readonly brand?: string,
  ) {}

  static fromJSON(data: Record<string, unknown>): StockSuggestionModel {
    return new StockSuggestionModel(
      data.id as string,
      data.description as string,
      data.unit as string,
      data.quantity as number,
      data.score as number,
      optionalString(data.brand),
    );
  }
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}
