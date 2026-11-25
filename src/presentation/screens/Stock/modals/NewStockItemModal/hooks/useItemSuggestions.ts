import { useEffect, useRef, useState } from "react";

import { useCases } from "@application/useCases";
import {
  AiUsageEntity,
  ItemSuggestionEntity,
  ItemSuggestionFields,
  ItemSuggestionNotice,
  ItemSuggestionSource,
} from "@domain/entities/stock/StockBarcodeEntity";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { initialInput } from "@domain/entities/stock/stockQuantity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import { formatQuantity } from "@screens/Stock/models/quantityFormat";

import { StockFormValues } from "./useForm";

export type SuggestionBanner =
  | "limit"
  | "notSure"
  | "searching"
  | "suggestions"
  | "unavailable";

interface Options {
  autoName?: string;
  barcode?: string;
  enabled: boolean;
  locale: string;
  owner?: string;
  ownerId?: string;
  setField: <K extends keyof StockFormValues>(
    field: K,
    value: StockFormValues[K],
  ) => void;
  values: StockFormValues;
}

type SourceField = keyof ItemSuggestionFields;

const MIN_NAME_CHARS = 3;
const NO_USAGE: AiUsageEntity = {
  light: { limit: 0, used: 0 },
  search: { limit: 0, used: 0 },
};
const UNAVAILABLE: ItemSuggestionEntity = {
  fields: {},
  notice: "AI_UNAVAILABLE",
  sources: {},
  usage: NO_USAGE,
};
const UNIT_VALUES: string[] = Object.values(StockUnits);

// Spec 121 FR 12-23: the new item form arrives filled by Open Food Facts and the AI, each field with its source,
// and "Preencher com IA" only fills the empty ones. Nothing is saved before "Salvar item".
function useItemSuggestions(options: Options) {
  const [sources, setSources] = useState<
    Partial<Record<SourceField, ItemSuggestionSource>>
  >({});
  const [notice, setNotice] = useState<ItemSuggestionNotice>();
  const [usage, setUsage] = useState<AiUsageEntity>();
  const [packageHint, setPackageHint] = useState<{
    text: string;
    unitKey: string;
  }>();
  const started = useRef(false);
  const cancelled = useRef(false);
  const latest = useRef(options);

  latest.current = options;

  const suggest = useMutation<
    Parameters<typeof useCases.suggestStockItemUseCase.execute>[0],
    ItemSuggestionEntity
  >({
    cacheKey: [useCases.suggestStockItemUseCase.uniqueName],
    // The form never breaks because of the suggestions: a failed call is the same as "unavailable" (FR 19).
    fetch: async (params) => {
      try {
        return await useCases.suggestStockItemUseCase.execute(params);
      } catch {
        return UNAVAILABLE;
      }
    },
  });
  // Read only once a name is typed (the button needs it): a plain form opens with no extra request.
  const todayUsage = useQuery<AiUsageEntity>({
    cacheKey: [useCases.getAiUsageUseCase.uniqueName],
    enabled:
      options.enabled &&
      options.values.description.trim().length >= MIN_NAME_CHARS,
    fetch: async () => {
      try {
        return await useCases.getAiUsageUseCase.execute();
      } catch {
        return NO_USAGE;
      }
    },
  });
  // A limit of 0 is "unknown" (the read failed): nothing is shown or blocked.
  function known(value?: AiUsageEntity) {
    return value && value.search.limit > 0 ? value : undefined;
  }
  const currentUsage = known(usage) ?? known(todayUsage.data);
  const searchLeft = currentUsage
    ? currentUsage.search.limit - currentUsage.search.used
    : undefined;

  function request(subject: { barcode: string } | { name: string }) {
    const { owner, ownerId } = latest.current;

    if (!owner || !ownerId) {
      return;
    }

    cancelled.current = false;
    suggest.mutate({ ...subject, owner, ownerId });
  }

  // From the reader or the quick add: the code or the typed name is asked as soon as the owner is known.
  useEffect(() => {
    if (!options.enabled || started.current || !options.ownerId) {
      return;
    }

    if (options.barcode) {
      started.current = true;
      request({ barcode: options.barcode });
    } else if (options.autoName) {
      started.current = true;
      request({ name: options.autoName });
    }
  }, [options.enabled, options.ownerId, options.owner]);

  useEffect(() => {
    if (suggest.status !== "success" || !suggest.data || cancelled.current) {
      return;
    }

    apply(suggest.data);
    suggest.reset();
  }, [suggest.status]);

  useEffect(() => {
    if (suggest.status === "error") {
      // The API never fails because of its providers: a transport error is the same as "unavailable".
      setNotice("AI_UNAVAILABLE");
      suggest.reset();
    }
  }, [suggest.status]);

  function apply(suggestion: ItemSuggestionEntity) {
    const { locale, setField, values } = latest.current;
    const { fields } = suggestion;
    const applied: Partial<Record<SourceField, ItemSuggestionSource>> = {};

    function fill<K extends keyof StockFormValues>(
      field: SourceField,
      key: K,
      value: StockFormValues[K] | undefined,
      empty: boolean,
    ) {
      const source = suggestion.sources[field];

      if (value !== undefined && empty && source) {
        setField(key, value);
        applied[field] = source;
      }
    }

    const unit =
      fields.unit && UNIT_VALUES.includes(fields.unit)
        ? (fields.unit as StockUnits)
        : undefined;
    const effectiveUnit =
      unit && values.unit === StockUnits.UNIT ? unit : values.unit;

    fill(
      "description",
      "description",
      fields.description,
      !values.description.trim(),
    );
    fill("brand", "brand", fields.brand, !values.brand.trim());
    fill("unit", "unit", unit, values.unit === StockUnits.UNIT);
    fill("categoryId", "categoryId", fields.categoryId, !values.categoryId);
    fill("locationId", "locationId", fields.locationId, !values.locationId);
    fill(
      "openedShelfLifeDays",
      "openedShelfLifeDays",
      fields.openedShelfLifeDays?.toString(),
      !values.openedShelfLifeDays.trim(),
    );

    // FR 17: the package is a hint; it fills the first lot of a kg/L item, a UNIT item starts at 1.
    if (fields.packageQuantity !== undefined) {
      const display = formatQuantity(
        fields.packageQuantity,
        effectiveUnit,
        locale,
      );

      setPackageHint({ text: display.text, unitKey: display.unitKey });

      if (effectiveUnit !== StockUnits.UNIT && !values.quantity.text.trim()) {
        setField(
          "quantity",
          initialInput(fields.packageQuantity, effectiveUnit),
        );
      }
    }

    if (
      latest.current.barcode &&
      effectiveUnit === StockUnits.UNIT &&
      !values.quantity.text.trim()
    ) {
      setField("quantity", initialInput(1, StockUnits.UNIT));
    }

    setSources((current) => ({ ...current, ...applied }));
    setNotice(suggestion.notice);
    setUsage(suggestion.usage);
  }

  const searching = suggest.isFetching && !cancelled.current;
  let banner: SuggestionBanner | undefined;

  if (searching) {
    banner = "searching";
  } else if (notice === "LIMIT_REACHED") {
    banner = "limit";
  } else if (notice === "AI_UNAVAILABLE") {
    banner = "unavailable";
  } else if (notice === "AI_NOT_SURE") {
    banner = "notSure";
  } else if (Object.keys(sources).length > 0) {
    banner = "suggestions";
  }

  return {
    banner,
    // "Preencher com IA" needs a typed name and a search left today (FR 18, 22).
    canFillWithAi:
      options.enabled &&
      options.values.description.trim().length >= MIN_NAME_CHARS &&
      !searching &&
      (searchLeft === undefined || searchLeft > 0),
    clearSource: (field: SourceField) =>
      setSources((current) => {
        if (!current[field]) {
          return current;
        }

        const next = { ...current };

        delete next[field];

        return next;
      }),
    isLimitReached: searchLeft !== undefined && searchLeft <= 0,
    onFillWithAi: () => request({ name: options.values.description.trim() }),
    // "Preencher sozinho": the answer is ignored (the server call may still count, FR 20).
    onSkip: () => {
      cancelled.current = true;
      suggest.reset();
    },
    packageHint,
    searching,
    sources,
    usage: currentUsage,
  };
}

export default useItemSuggestions;
