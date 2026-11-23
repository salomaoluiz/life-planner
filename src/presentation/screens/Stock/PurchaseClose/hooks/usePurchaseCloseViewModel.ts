import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { useCases } from "@application/useCases";
import { ApiBusinessError, GenericError } from "@domain/entities/errors";
import { toCurrencyCode } from "@domain/entities/financial/Currency";
import {
  PurchaseRowEntity,
  PurchaseRowStates,
} from "@domain/entities/stock/PurchaseEntity";
import { invalidateFetcherData, useQuery } from "@infrastructure/fetcher";
import { uuidv4 } from "@infrastructure/uuid";
import useOwners from "@presentation/hooks/useOwners";
import { useTranslationLocale } from "@presentation/i18n";
import { todayIso } from "@screens/Stock/modals/StartPurchaseModal/hooks/useStartPurchaseViewModel";
import { parseExpiration } from "@screens/Stock/Purchase/hooks/usePurchaseViewModel";

import {
  breakdownOf,
  CloseStep,
  parseWeight,
  RowEdit,
  visibleSteps,
} from "../models/ClosingModel";

export type PurchaseCloseVM = ReturnType<typeof usePurchaseCloseViewModel>;

type ErrorKey =
  | "stock.close.errorDefault"
  | "stock.close.errorPrice"
  | "stock.close.errorWeight"
  | "stock.purchase.errorSave";

function codeOf(error: unknown): string | undefined {
  if (!(error instanceof GenericError)) {
    return undefined;
  }

  const cause = error.context.error;

  return cause instanceof ApiBusinessError
    ? (cause.body?.code as string | undefined)
    : undefined;
}

function isoDate(text: string): string | undefined {
  const parsed = parseExpiration(text);

  return typeof parsed === "string" ? parsed : undefined;
}

export default usePurchaseCloseViewModel;

function usePurchaseCloseViewModel() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getLocale } = useTranslationLocale();
  const owners = useOwners();
  const [stepIndex, setStepIndex] = useState(0);
  const [receiptTotalCents, setReceiptTotal] = useState(0);
  const [edits, setEdits] = useState<Record<string, RowEdit | undefined>>({});
  const [matches, setMatches] = useState<Record<string, string | undefined>>(
    {},
  );
  const [accepted, setAccepted] = useState<Record<string, boolean | undefined>>(
    {},
  );
  const [source, setSource] = useState<
    undefined | { id: string; type: "ACCOUNT" | "CARD" }
  >();
  const [dateText, setDateText] = useState("");
  const [defaultCategoryId, setDefaultCategoryId] = useState<
    string | undefined
  >();
  const [errorKey, setErrorKey] = useState<ErrorKey | undefined>();
  const [lockedBy, setLockedBy] = useState(false);
  const [saving, setSaving] = useState(false);

  const view = useQuery({
    cacheKey: [useCases.getPurchaseUseCase.uniqueName, id ?? ""],
    enabled: !!id,
    fetch: async () => useCases.getPurchaseUseCase.execute({ id }),
  });
  const purchase = view.data?.purchase;
  const preview = useQuery({
    cacheKey: [useCases.getClosePreviewUseCase.uniqueName, id ?? ""],
    enabled: !!id,
    fetch: async () => useCases.getClosePreviewUseCase.execute({ id }),
  });
  const list = useQuery({
    cacheKey: [
      useCases.getShoppingListUseCase.uniqueName,
      purchase?.listId ?? "",
    ],
    enabled: !!purchase,
    fetch: async () =>
      useCases.getShoppingListUseCase.execute({
        id: purchase?.listId as string,
      }),
  });
  const ownerIds = useMemo(
    () => (owners.data ?? []).map((owner) => owner.id),
    [owners.data],
  );
  const accounts = useQuery({
    cacheKey: [useCases.getFinancialAccountsUseCase.uniqueName, "stock-close"],
    enabled: ownerIds.length > 0,
    fetch: async () => useCases.getFinancialAccountsUseCase.execute(ownerIds),
  });
  const cards = useQuery({
    cacheKey: [
      useCases.getFinancialCreditCardsUseCase.uniqueName,
      "stock-close",
    ],
    enabled: ownerIds.length > 0,
    fetch: async () =>
      useCases.getFinancialCreditCardsUseCase.execute(ownerIds),
  });
  const categories = useQuery({
    cacheKey: [
      useCases.getFinancialCategoriesUseCase.uniqueName,
      "stock-close",
    ],
    enabled: ownerIds.length > 0,
    fetch: async () => useCases.getFinancialCategoriesUseCase.execute(ownerIds),
  });

  // FR 30: one closer: the lock is taken on open and released on leave.
  useEffect(() => {
    if (!id) {
      return undefined;
    }

    useCases.closingLockUseCase
      .execute({ id })
      .then(() => setLockedBy(false))
      .catch(() => setLockedBy(true));

    return () => {
      void useCases.closingLockUseCase.execute({ id, release: true });
    };
  }, [id]);

  const cartRows: PurchaseRowEntity[] = (view.data?.rows ?? []).filter(
    (row) => row.state === PurchaseRowStates.IN_CART,
  );
  const missing = new Set(preview.data?.missingPrices ?? []);
  const weightRows = new Set(preview.data?.unknownWeight ?? []);
  const newItems = preview.data?.newItems ?? [];
  const expirations = preview.data?.expirations ?? [];
  const steps = visibleSteps({
    hasExpirations: expirations.length > 0,
    hasNewItems: newItems.length > 0,
  });
  const step: CloseStep = steps[Math.min(stepIndex, steps.length - 1)];
  const breakdown = breakdownOf({ edits, receiptTotalCents, rows: cartRows });
  const currency = toCurrencyCode(purchase?.currency);
  const date = dateText || todayIso();
  const accountOptions = (accounts.data ?? []).filter(
    (account) =>
      account.status === "ACTIVE" &&
      account.ownerId === list.data?.list.ownerId &&
      toCurrencyCode(account.currency) === currency,
  );
  const cardOptions = (cards.data ?? []).filter(
    (card) =>
      card.status === "ACTIVE" &&
      card.ownerId === list.data?.list.ownerId &&
      toCurrencyCode(card.currency) === currency,
  );
  const expenseCategories = (categories.data ?? []).filter(
    (category) => category.type === "EXPENSE" && category.status !== "ARCHIVED",
  );
  const needsDefault =
    preview.data?.needsDefaultFinanceCategory === true &&
    !list.data?.list.defaultFinanceCategoryId;

  function patchEdit(rowId: string, patch: RowEdit) {
    setEdits((current) => ({
      ...current,
      [rowId]: { ...current[rowId], ...patch },
    }));
  }

  function validateStep(): ErrorKey | undefined {
    if (step === "prices") {
      const lacksWeight = [...weightRows].some(
        (rowId) => parseWeight(edits[rowId]?.weight) === undefined,
      );

      if (lacksWeight) {
        return "stock.close.errorWeight";
      }

      return breakdown.mode === "TOTAL_BELOW" || breakdown.mode === "UNPRICED"
        ? "stock.close.errorPrice"
        : undefined;
    }

    if (step === "payment" && needsDefault && !defaultCategoryId) {
      return "stock.close.errorDefault";
    }

    return undefined;
  }

  function onContinue() {
    const error = validateStep();

    setErrorKey(error);

    if (!error) {
      setStepIndex((current) => Math.min(current + 1, steps.length - 1));
    }
  }

  function onBackStep() {
    setErrorKey(undefined);

    if (stepIndex === 0) {
      router.back();
    } else {
      setStepIndex((current) => current - 1);
    }
  }

  async function onFinish() {
    const error = validateStep();

    setErrorKey(error);

    if (error || !purchase || !source || saving) {
      return;
    }

    setSaving(true);

    try {
      await useCases.closePurchaseUseCase.execute({
        accountId: source.type === "ACCOUNT" ? source.id : undefined,
        clientId: uuidv4(),
        creditCardId: source.type === "CARD" ? source.id : undefined,
        date: isoDate(date.includes("/") ? date : "") ?? date,
        defaultFinanceCategoryId: defaultCategoryId,
        id,
        receiptTotalCents,
        rows: cartRows.map((row) => {
          const edit = edits[row.id];
          const expiration = expirations.find((item) => item.rowId === row.id);

          return {
            expirationDate:
              expiration && accepted[row.id]
                ? expiration.suggestedDate
                : undefined,
            itemId: matches[row.id],
            quantity: parseWeight(edit?.weight),
            rowId: row.id,
            unitPriceCents:
              edit?.priceCents && edit.priceCents > 0
                ? edit.priceCents
                : undefined,
            unknownPrice: edit?.unknown === true ? true : undefined,
          };
        }),
      });
      await invalidateFetcherData();
      router.replace(`/stock/list/${purchase.listId}` as never);
    } catch (failure) {
      const code = codeOf(failure);

      if (code === "PURCHASE_CLOSING") {
        setLockedBy(true);
      }

      setErrorKey(
        ({
          PURCHASE_DEFAULT_FINANCE_CATEGORY_REQUIRED:
            "stock.close.errorDefault",
          PURCHASE_PRICE_REQUIRED: "stock.close.errorPrice",
          PURCHASE_TOTAL_BELOW_ITEMS: "stock.close.errorPrice",
          PURCHASE_WEIGHT_REQUIRED: "stock.close.errorWeight",
        }[code ?? ""] as ErrorKey | undefined) ?? "stock.purchase.errorSave",
      );
    } finally {
      setSaving(false);
    }
  }

  return {
    accepted,
    accountOptions,
    breakdown,
    cardOptions,
    currency,
    dateText: date,
    defaultCategoryId,
    edits,
    errorKey,
    expenseCategories,
    expirations,
    isLoading: view.isFetching && !view.data,
    languageTag: getLocale().languageTag,
    lockedBy,
    marketId: purchase?.marketId,
    matches,
    missingPrices: missing,
    needsDefault,
    newItems,
    onBackStep,
    onContinue,
    onDateChange: setDateText,
    onDefaultCategoryChange: setDefaultCategoryId,
    onExpirationToggle: (rowId: string) =>
      setAccepted((current) => ({ ...current, [rowId]: !current[rowId] })),
    onFinish,
    onMatch: (rowId: string, itemId?: string) =>
      setMatches((current) => ({ ...current, [rowId]: itemId })),
    onPriceChange: (rowId: string, priceCents: number) =>
      patchEdit(rowId, { priceCents, unknown: false }),
    onReceiptChange: setReceiptTotal,
    onSourceChange: setSource,
    onUnknownToggle: (rowId: string) =>
      patchEdit(rowId, { unknown: !edits[rowId]?.unknown }),
    onWeightChange: (rowId: string, weight: string) =>
      patchEdit(rowId, { weight }),
    previewParts: preview.data?.financeParts,
    receiptTotalCents,
    rows: cartRows,
    saving,
    source,
    step,
    stepIndex: Math.min(stepIndex, steps.length - 1),
    steps,
    unknownWeight: weightRows,
  };
}
