import StockModel from "@data/models/stock/StockModel";

type Json = Record<string, unknown>;

export class AiUsageModel {
  constructor(
    readonly light: { limit: number; used: number },
    readonly search: { limit: number; used: number },
  ) {}

  static fromJSON(data: Json): AiUsageModel {
    function counter(value: unknown) {
      const row = (value ?? {}) as Json;

      return { limit: Number(row.limit ?? 0), used: Number(row.used ?? 0) };
    }

    return new AiUsageModel(counter(data.light), counter(data.search));
  }
}

// `POST /stock/item-suggestions` (spec 121): absent fields are omitted by the API.
export class ItemSuggestionModel {
  constructor(
    readonly fields: Json,
    readonly sources: Record<string, string>,
    readonly usage: AiUsageModel,
    readonly notice?: string,
  ) {}

  static fromJSON(data: Json): ItemSuggestionModel {
    return new ItemSuggestionModel(
      (data.fields as Json | undefined) ?? {},
      (data.sources as Record<string, string> | undefined) ?? {},
      AiUsageModel.fromJSON((data.usage as Json | undefined) ?? {}),
      (data.notice as null | string | undefined) ?? undefined,
    );
  }
}

// `GET /stock/barcodes/:code` (spec 121).
export class StockBarcodeLookupModel {
  constructor(
    readonly code: string,
    readonly matches: StockBarcodeMatchModel[],
  ) {}

  static fromJSON(data: Json): StockBarcodeLookupModel {
    return new StockBarcodeLookupModel(
      data.code as string,
      ((data.matches as Json[] | undefined) ?? []).map((match) =>
        StockBarcodeMatchModel.fromJSON(match),
      ),
    );
  }
}

export class StockBarcodeMatchModel {
  constructor(
    readonly item: StockModel,
    readonly owner: string,
    readonly ownerId: string,
    readonly ownerName: string,
    readonly readOnly: boolean,
  ) {}

  static fromJSON(data: Json): StockBarcodeMatchModel {
    return new StockBarcodeMatchModel(
      StockModel.fromJSON(data.item as Json),
      data.owner as string,
      data.ownerId as string,
      data.ownerName as string,
      Boolean(data.readOnly),
    );
  }
}
