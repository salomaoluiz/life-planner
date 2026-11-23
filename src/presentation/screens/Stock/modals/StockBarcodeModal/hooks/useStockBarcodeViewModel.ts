import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import {
  StockBarcodeLookupDTO,
  StockBarcodeMatchDTO,
} from "@application/dto/stock/StockBarcodeDTO";
import { useCases } from "@application/useCases";
import { StockBarcodeInvalid } from "@domain/entities/errors";
import {
  cleanBarcode,
  expandUpcE,
  locationIdFromLink,
} from "@domain/entities/stock/barcode";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import {
  initialInput,
  QuantityInput,
  toQuantity,
} from "@domain/entities/stock/stockQuantity";
import {
  ScannedCode,
  useScannerPermission,
  vibrateOnScan,
} from "@infrastructure/barcodeScanner";
import { invalidateFetcherData, useMutation } from "@infrastructure/fetcher";
import { uuidv4 } from "@infrastructure/uuid";
import { useTranslationLocale } from "@presentation/i18n";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";
import useStockQuickMovement from "@screens/Stock/hooks/useStockQuickMovement";

import BarcodeMatchUIModel from "../models/BarcodeMatchUIModel";

export type BarcodeMessage = "failed" | "notRecognized";

export type StockBarcodeVM = ReturnType<typeof useStockBarcodeViewModel>;

const DEFAULT_STEP = 1;

// Spec 121 FR 4-11: reads or takes a code, finds the item in every readable owner and moves it in one tap; a code
// nobody has opens the new item form (with the suggestions of FR 12).
function useStockBarcodeViewModel() {
  const { closeModal, replaceModal } = useModalNavigation();
  const { getLocale } = useTranslationLocale();
  // The stock filter of the screen that opened the reader: a single owner skips the owner picker (FR 8).
  const params = useLocalSearchParams<{
    // A code to look up on open (the form's "Abrir item" and the link of a code to an item).
    code?: string;
    ownerId?: string;
    // Shopping mode (spec 121 FR 25): the code adds a row to this purchase instead of opening the sheet.
    purchaseId?: string;
  }>();
  const scanner = useScannerPermission();
  const [typed, setTyped] = useState("");
  const [torch, setTorch] = useState(false);
  const [cameraError, setCameraError] = useState<"denied" | "unavailable">();
  const [lookupCode, setLookupCode] = useState<string>();
  const [result, setResult] = useState<StockBarcodeLookupDTO>();
  const [selected, setSelected] = useState<StockBarcodeMatchDTO>();
  const [message, setMessage] = useState<BarcodeMessage>();
  const [quantity, setQuantity] = useState<QuantityInput>(
    initialInput(DEFAULT_STEP, StockUnits.UNIT),
  );
  const locale = getLocale().languageTag;
  const lookup = useMutation({
    cacheKey: [useCases.lookupStockBarcodeUseCase.uniqueName],
    fetch: useCases.lookupStockBarcodeUseCase.execute,
  });
  const addByCode = useMutation({
    cacheKey: [useCases.addPurchaseRowByCodeUseCase.uniqueName],
    fetch: useCases.addPurchaseRowByCodeUseCase.execute,
  });
  const [added, setAdded] = useState<{ name: string; suggested: boolean }>();
  const quick = useStockQuickMovement({
    onSettled: async () =>
      invalidateFetcherData([
        useCases.getStockItemsUseCase.uniqueName,
        useCases.getFrequentStockItemsUseCase.uniqueName,
      ]),
  });

  useEffect(() => {
    if (params.code) {
      search(params.code);
    }
  }, [params.code]);

  useEffect(() => {
    if (scanner.status === "loading") {
      void scanner.request();
    }
  }, [scanner.status]);

  useEffect(() => {
    if (addByCode.status === "success" && addByCode.data) {
      setAdded({
        name: addByCode.data.row.description,
        suggested: addByCode.data.source !== "ITEM",
      });
      void invalidateFetcherData([useCases.getPurchaseUseCase.uniqueName]);
      addByCode.reset();
      setTyped("");
    } else if (addByCode.status === "error") {
      addByCode.reset();
      setMessage("failed");
    }
  }, [addByCode.status]);

  useEffect(() => {
    if (lookup.status === "success" && lookup.data && lookupCode) {
      lookup.reset();
      onFound(lookup.data, lookupCode);
    } else if (lookup.status === "error") {
      lookup.reset();
      setMessage(
        lookup.error instanceof StockBarcodeInvalid
          ? "notRecognized"
          : "failed",
      );
    }
  }, [lookup.status]);

  function onFound(found: StockBarcodeLookupDTO, code: string) {
    if (found.matches.length === 0) {
      // Nobody has it: the new item form arrives with the code and the suggestions (FR 12).
      replaceModal("add_new_stock_item", {
        barcode: found.code || code,
        ownerId: params.ownerId,
      });

      return;
    }

    const preferred =
      found.matches.length === 1
        ? found.matches[0]
        : found.matches.find((match) => match.ownerId === params.ownerId);

    setResult(found);
    selectMatch(preferred);
  }

  function selectMatch(match?: StockBarcodeMatchDTO) {
    setSelected(match);

    if (match) {
      setQuantity(
        initialInput(match.item.quickStep ?? DEFAULT_STEP, match.item.unit),
      );
    }
  }

  function search(raw: string) {
    const code = cleanBarcode(raw);

    if (!code) {
      setMessage("notRecognized");

      return;
    }

    setMessage(undefined);
    setAdded(undefined);

    if (params.purchaseId) {
      addByCode.mutate({
        clientId: uuidv4(),
        code,
        purchaseId: params.purchaseId,
      });

      return;
    }

    setLookupCode(code);
    lookup.mutate({ code });
  }

  function onScan(scanned: ScannedCode) {
    if (busy) {
      return;
    }

    vibrateOnScan();

    if (scanned.type === "qr") {
      const locationId = locationIdFromLink(scanned.code, webBase());

      if (locationId) {
        // FR 7: a location QR opens that location instead of a barcode lookup.
        closeModal();
        router.push(`/stock/locations/${locationId}` as never);

        return;
      }
    }

    search(scanned.type === "upc_e" ? expandUpcE(scanned.code) : scanned.code);
  }

  function reset() {
    setResult(undefined);
    setSelected(undefined);
    setMessage(undefined);
    setTyped("");
  }

  function onAction(direction: -1 | 1) {
    if (!selected || selected.readOnly) {
      return;
    }

    const amount = toQuantity(quantity, selected.item.unit);

    if (!amount || amount <= 0) {
      return;
    }

    quick.onStep(selected.item, direction, amount);
    void quick.commit();
    reset();
  }

  function onOpen() {
    if (!selected || selected.readOnly) {
      return;
    }

    void quick.onOpen(selected.item);
    reset();
  }

  function onOpenDetail() {
    if (!selected) {
      return;
    }

    closeModal();
    router.push(`/stock?item=${selected.item.id}` as never);
  }

  const busy =
    lookup.isFetching || addByCode.isFetching || !!selected || !!result;
  const matches = useMemo(
    () =>
      (result?.matches ?? []).map(
        (match) => new BarcodeMatchUIModel(match, locale),
      ),
    [result, locale],
  );
  const sheet = selected
    ? new BarcodeMatchUIModel(selected, locale)
    : undefined;

  return {
    added,
    cameraStatus: cameraError ?? scanner.status,
    code: lookupCode,
    isLooking: lookup.isFetching || addByCode.isFetching,
    matches,
    message,
    onAction,
    onCameraError: setCameraError,
    onClose: closeModal,
    onOpen,
    onOpenDetail,
    onPickOwner: (index: number) => selectMatch(result?.matches[index]),
    onQuantityChange: setQuantity,
    onScan,
    onScanAnother: reset,
    onSubmitTyped: () => search(typed),
    onToggleTorch: () => setTorch((on) => !on),
    onTypedChange: (text: string) => {
      setTyped(text);
      setMessage(undefined);
    },
    paused: busy,
    quantity,
    quick,
    sheet,
    showsOwnerPicker: !!result && result.matches.length > 1 && !selected,
    torch,
    typed,
  };
}

export default useStockBarcodeViewModel;

// The web host of the app (the QR of a location points to it); on the web the page's own origin is the fallback.
function webBase(): string | undefined {
  // Direct read is inlined by Expo at build time; the alias keeps it readable at runtime (tests).
  const envs = process.env;
  const configured =
    process.env.EXPO_PUBLIC_PROJECT_WEBSITE_URL ??
    envs.EXPO_PUBLIC_PROJECT_WEBSITE_URL;

  if (configured) {
    return configured;
  }

  return typeof window !== "undefined" ? window.location?.origin : undefined;
}
