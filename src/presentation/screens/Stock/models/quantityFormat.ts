import { StockUnits } from "@domain/entities/stock/StockEntity";
import { formatAmount, toDisplay } from "@domain/entities/stock/stockQuantity";
import { TranslationKeys } from "@presentation/i18n/types";

// 500 g, 1,5 kg, 3 un (spec 116 FR 3): the amount in the locale and the key of its unit.
export function formatQuantity(
  quantity: number,
  unit: StockUnits,
  locale?: string,
): { text: string; unitKey: TranslationKeys } {
  const display = toDisplay(quantity, unit);

  return {
    text: formatAmount(display.amount, locale),
    unitKey: `common.units.${display.unitKey}` as TranslationKeys,
  };
}
