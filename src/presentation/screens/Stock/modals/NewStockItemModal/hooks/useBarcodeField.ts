import { useState } from "react";

import { StockBarcodeLookupDTO } from "@application/dto/stock/StockBarcodeDTO";
import { useCases } from "@application/useCases";
import { StockBarcodeInUse } from "@domain/entities/errors";
import { cleanBarcode } from "@domain/entities/stock/barcode";
import { useMutation } from "@infrastructure/fetcher";

export interface BarcodeInUse {
  description: string;
}

interface Options {
  // A code that already belongs to the item being edited is not a duplicate.
  itemId?: string;
  ownerId?: string;
  saveError: unknown;
  setBarcode: (code: string) => void;
}

// Spec 121 FR 2, 4: the camera fills the code of the form, and a code another item of the owner already has (found
// right after the scan or answered by the save with a 409) offers "Abrir item".
function useBarcodeField(options: Options) {
  const [isScanning, setIsScanning] = useState(false);
  const [duplicate, setDuplicate] = useState<BarcodeInUse>();
  const lookup = useMutation<{ code: string }, StockBarcodeLookupDTO>({
    cacheKey: [useCases.lookupStockBarcodeUseCase.uniqueName, "form"],
    // A failed lookup only means "no duplicate found": the save answers 409 if there is one.
    fetch: async (params) => {
      try {
        return await useCases.lookupStockBarcodeUseCase.execute(params);
      } catch {
        return { code: params.code, matches: [] };
      }
    },
  });

  // The lookup answers through the mutation; the duplicate is read from its result on the next render.
  const held = lookup.data?.matches.find(
    (match) =>
      match.ownerId === options.ownerId && match.item.id !== options.itemId,
  );
  const answeredInUse =
    options.saveError instanceof StockBarcodeInUse
      ? { description: options.saveError.description }
      : undefined;
  const inUse =
    answeredInUse ??
    (held ? { description: held.item.description } : undefined) ??
    duplicate;

  function onScanned(raw: string) {
    const code = cleanBarcode(raw);

    setIsScanning(false);

    if (code) {
      options.setBarcode(code);
      setDuplicate(undefined);
      lookup.mutate({ code });
    }
  }

  return {
    inUse,
    isScanning,
    onClose: () => setIsScanning(false),
    onOpen: () => setIsScanning(true),
    onScanned,
    // The typed code changed: the old answer no longer applies.
    onTyped: () => {
      setDuplicate(undefined);
      lookup.reset();
    },
  };
}

export default useBarcodeField;
