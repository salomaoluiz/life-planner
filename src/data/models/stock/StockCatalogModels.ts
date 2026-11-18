export class StockCategoryModel {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly status: string,
    readonly itemCount: number,
    readonly children: StockCategoryModel[],
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
  ) {}

  static fromJSON(data: Record<string, unknown>): StockLocationDetailModel {
    return new StockLocationDetailModel(
      data.id as string,
      data.name as string,
      data.status as string,
      (data.itemCount as number | undefined) ?? 0,
      data.owner as string,
      data.ownerId as string,
    );
  }
}

export class StockLocationModel {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly status: string,
    readonly itemCount: number,
  ) {}

  static fromJSON(data: Record<string, unknown>): StockLocationModel {
    return new StockLocationModel(
      data.id as string,
      data.name as string,
      data.status as string,
      (data.itemCount as number | undefined) ?? 0,
    );
  }
}

export class StockOwnerChangePreviewModel {
  constructor(
    readonly category: { from?: string; to?: string },
    readonly location: { from?: string; to?: string },
  ) {}

  static fromJSON(data: Record<string, unknown>): StockOwnerChangePreviewModel {
    function side(value: unknown) {
      const raw = (value ?? {}) as Record<string, unknown>;

      return { from: optionalString(raw.from), to: optionalString(raw.to) };
    }

    return new StockOwnerChangePreviewModel(
      side(data.category),
      side(data.location),
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
