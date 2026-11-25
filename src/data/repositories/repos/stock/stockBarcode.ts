import { Datasources } from "@data/datasource";
import {
  AiUsageEntity,
  ItemSuggestionEntity,
  ItemSuggestionFields,
  ItemSuggestionNotice,
  StockBarcodeLookupEntity,
} from "@domain/entities/stock/StockBarcodeEntity";

import { toStockEntity } from "./toStockEntity";

export async function getAiUsage(
  datasources: Datasources,
): Promise<AiUsageEntity> {
  const usage = await datasources.stockDatasource.getAiUsage();

  return { light: usage.light, search: usage.search };
}

export async function lookupStockBarcode(
  code: string,
  datasources: Datasources,
): Promise<StockBarcodeLookupEntity> {
  const lookup = await datasources.stockDatasource.lookupStockBarcode(code);

  return {
    code: lookup.code,
    matches: lookup.matches.map((match) => ({
      item: toStockEntity(match.item),
      owner: match.owner,
      ownerId: match.ownerId,
      ownerName: match.ownerName,
      readOnly: match.readOnly,
    })),
  };
}

export async function suggestStockItem(
  params: Parameters<Datasources["stockDatasource"]["suggestStockItem"]>[0],
  datasources: Datasources,
): Promise<ItemSuggestionEntity> {
  const suggestion = await datasources.stockDatasource.suggestStockItem(params);

  return {
    fields: suggestion.fields as ItemSuggestionFields,
    notice: suggestion.notice as ItemSuggestionNotice | undefined,
    sources: suggestion.sources as ItemSuggestionEntity["sources"],
    usage: { light: suggestion.usage.light, search: suggestion.usage.search },
  };
}
