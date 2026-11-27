import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { financeKeys } from "@application/queryKeys/financeKeys";
import { useCases } from "@application/useCases";
import { markFetcherDataStale, useQuery } from "@infrastructure/fetcher";
import { TranslationKeys } from "@presentation/i18n/types";
import { toTreeNodes } from "@presentation/utils/categoryTreeNodes";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";
import { invalidateAfterWrite } from "@screens/Financial/Transactions/pending/writeCache";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";
import { centsToDecimalString } from "@utils/money";

import {
  applyToAdjustment,
  applyToPart,
  createInitialState,
  isSameState,
  isValid,
  MAX_PARTS,
  netType,
  newPart,
  remainingCents,
  SplitFormState,
  SplitPartDraft,
  stateFromSplit,
  stateFromTransaction,
  toCreateParams,
  totalCents,
  toUpdateParams,
  validate,
} from "../models/splitFormState";

async function fetchByOwners<T>(
  owners: OwnerDTO[],
  execute: (ownerIds: string[]) => Promise<T>,
) {
  return execute(owners.map((owner) => owner.id));
}

// The source (account or card) is one field: `account:<id>` or `card:<id>`.
const ACCOUNT_PREFIX = "account:";
const CARD_PREFIX = "card:";

function sourceValueOf(state?: SplitFormState): string | undefined {
  if (state?.accountId) {
    return `${ACCOUNT_PREFIX}${state.accountId}`;
  }

  return state?.creditCardId
    ? `${CARD_PREFIX}${state.creditCardId}`
    : undefined;
}

function useSplitFormViewModel() {
  const { closeModal } = useModalNavigation();
  const params = useLocalSearchParams<{ fromId?: string; splitId?: string }>();
  const splitId = params.splitId;
  const fromId = params.fromId;
  const isEditing = !!splitId;

  const owners = useActiveOwners();
  const accounts = useQuery({
    cacheKey: financeKeys.accounts.raw(),
    enabled: !!owners.data,
    fetch: async () =>
      fetchByOwners(owners.data!, useCases.getFinancialAccountsUseCase.execute),
  });
  const cards = useQuery({
    cacheKey: financeKeys.creditCards.raw(),
    enabled: !!owners.data,
    fetch: async () =>
      fetchByOwners(
        owners.data!,
        useCases.getFinancialCreditCardsUseCase.execute,
      ),
  });
  const categories = useQuery({
    cacheKey: financeKeys.categories.raw(),
    enabled: !!owners.data,
    fetch: async () =>
      fetchByOwners(
        owners.data!,
        useCases.getFinancialCategoriesUseCase.execute,
      ),
  });
  const tags = useQuery({
    cacheKey: financeKeys.tags.raw(),
    enabled: !!owners.data,
    fetch: async () =>
      fetchByOwners(owners.data!, useCases.getFinancialTagsUseCase.execute),
  });
  const existing = useQuery({
    cacheKey: financeKeys.splits.raw(splitId ?? ""),
    enabled: isEditing,
    fetch: async () => useCases.getFinancialSplitUseCase.execute(splitId!),
  });
  const source = useQuery({
    cacheKey: financeKeys.transactions.raw("byId", fromId ?? ""),
    enabled: !isEditing && !!fromId && !!owners.data,
    fetch: async () =>
      useCases.getFinancialTransactionByIdUseCase.execute({
        id: fromId!,
        ownerIds: owners.data!.map((owner) => owner.id),
      }),
  });

  const [state, setState] = useState<SplitFormState>();
  const [baseline, setBaseline] = useState<SplitFormState>();
  const [submitted, setSubmitted] = useState(false);
  const [isBlocking, setBlocking] = useState(false);
  const [errorKey, setErrorKey] = useState<TranslationKeys>();
  const [isDiscardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isUndoDialogOpen, setUndoDialogOpen] = useState(false);
  const [isTotalTyped, setTotalTyped] = useState(false);

  // The form starts once: a new one blank (or from the saved transaction being split), an edit from the stored split.
  useEffect(() => {
    if (state || !accounts.data || !owners.data) {
      return;
    }
    let initial: SplitFormState | undefined;

    if (isEditing) {
      initial = existing.data ? stateFromSplit(existing.data) : undefined;
    } else if (fromId) {
      initial = source.data ? stateFromTransaction(source.data) : undefined;
    } else {
      const writable = new Set(owners.data.map((owner) => owner.id));
      const favorite = accounts.data.find(
        (account) =>
          account.isFavorite &&
          writable.has(account.ownerId) &&
          account.status !== "ARCHIVED",
      );

      initial = createInitialState(new Date(), { accountId: favorite?.id });
    }
    if (initial) {
      setState(initial);
      setBaseline(initial);
      setTotalTyped(initial.totalPaidCents > 0);
    }
  }, [
    accounts.data,
    existing.data,
    fromId,
    isEditing,
    owners.data,
    source.data,
    state,
  ]);

  const sourceOptions = useMemo(() => {
    const writable = new Set((owners.data ?? []).map((owner) => owner.id));
    const selected = state?.accountId ?? state?.creditCardId;

    return [
      ...(accounts.data ?? [])
        .filter(
          (account) =>
            writable.has(account.ownerId) &&
            (account.status !== "ARCHIVED" || account.id === selected),
        )
        .map((account) => ({
          label: `${account.name} · ${account.currency}`,
          ownerId: account.ownerId,
          value: `${ACCOUNT_PREFIX}${account.id}`,
        })),
      ...(cards.data ?? [])
        .filter(
          (card) =>
            writable.has(card.ownerId) &&
            (card.status !== "ARCHIVED" || card.id === selected),
        )
        .map((card) => ({
          label: card.lastDigits
            ? `${card.title} ••${card.lastDigits}`
            : card.title,
          ownerId: card.ownerId,
          value: `${CARD_PREFIX}${card.id}`,
        })),
    ];
  }, [
    accounts.data,
    cards.data,
    owners.data,
    state?.accountId,
    state?.creditCardId,
  ]);
  const sourceValue = sourceValueOf(state);
  const sourceOwnerId = sourceOptions.find(
    (option) => option.value === sourceValue,
  )?.ownerId;
  const currency =
    (state?.accountId
      ? accounts.data?.find((account) => account.id === state.accountId)
          ?.currency
      : cards.data?.find((card) => card.id === state?.creditCardId)
          ?.currency) ?? "BRL";
  const isCard = !!state?.creditCardId;

  // Categories of the owner of the source, by type, as nodes of the shared tree picker (spec 126).
  function categoryNodes(type: "EXPENSE" | "INCOME", selectedId?: string) {
    return toTreeNodes(
      (categories.data ?? []).filter(
        (category) =>
          category.type === type &&
          (category.status !== "ARCHIVED" || category.id === selectedId) &&
          (!sourceOwnerId || category.scopeOwnerIds.includes(sourceOwnerId)),
      ),
    );
  }

  const tagSuggestions = useMemo(
    () =>
      (tags.data ?? [])
        .filter(
          (tag) => !!sourceOwnerId && tag.scopeOwnerIds.includes(sourceOwnerId),
        )
        .sort(
          (a, b) =>
            b.usageCount - a.usageCount ||
            a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
        )
        .map((tag) => ({
          id: tag.id,
          label: tag.name,
          meta: tag.usageCount > 0 ? String(tag.usageCount) : undefined,
        })),
    [tags.data, sourceOwnerId],
  );

  const errors = state ? validate(state, { isEditing }) : {};
  const isDirty = !!state && !!baseline && !isSameState(state, baseline);
  const remaining = state ? remainingCents(state) : 0;
  const sumCents = state ? totalCents(state.parts) : 0;

  function transform(fn: (current: SplitFormState) => SplitFormState) {
    setState((current) => (current ? fn(current) : current));
    setErrorKey(undefined);
  }
  function change(patch: Partial<SplitFormState>) {
    transform((current) => ({ ...current, ...patch }));
  }
  function changePart(key: string, patch: Partial<SplitPartDraft>) {
    transform((current) => ({
      ...current,
      parts: current.parts.map((part) =>
        part.key === key ? { ...part, ...patch } : part,
      ),
    }));
  }

  async function finish() {
    await invalidateAfterWrite(
      { invoiceMonths: "all", listMonths: "all", projections: true },
      { refetch: false },
    );
    markFetcherDataStale(financeKeys.splits.all());
    closeModal();
  }

  async function run(action: () => Promise<unknown>) {
    setBlocking(true);
    setErrorKey(undefined);
    try {
      await action();
      await finish();
    } catch (error) {
      setErrorKey(
        getFinancialErrorMessageKey(error) ?? "common.errors.generic",
      );
    } finally {
      setBlocking(false);
    }
  }

  async function onSave() {
    setSubmitted(true);
    if (!state || !isValid(errors) || isBlocking) {
      return;
    }
    await run(async () =>
      isEditing
        ? useCases.updateFinancialSplitUseCase.execute(
            toUpdateParams(state, splitId!),
          )
        : useCases.createFinancialSplitUseCase.execute(
            toCreateParams(state, fromId),
          ),
    );
  }

  async function onDeleteConfirm() {
    setDeleteDialogOpen(false);
    await run(async () =>
      useCases.deleteFinancialSplitUseCase.execute(splitId!),
    );
  }

  // FR 43: one ordinary transaction with the net value and the category of the largest part (a PATCH with one part).
  async function onUndoConfirm() {
    setUndoDialogOpen(false);
    if (!state) {
      return;
    }
    const type = netType(state.parts);
    const candidates = state.parts.filter(
      (part) => !part.adjustment && !!part.id,
    );
    const largest = [...candidates].sort(
      (a, b) =>
        Number(b.type === type) - Number(a.type === type) ||
        Math.abs(b.cents) - Math.abs(a.cents),
    )[0];

    if (!largest) {
      return;
    }
    await run(async () =>
      useCases.updateFinancialSplitUseCase.execute({
        id: splitId!,
        parts: [
          {
            categoryId: largest.categoryId,
            description: null,
            id: largest.id,
            type,
            value: centsToDecimalString(totalCents(state.parts)),
          },
        ],
      }),
    );
  }

  function onClose() {
    // Spec 061 FR 2: the modal cannot be closed while a blocking request runs.
    if (isBlocking) {
      return;
    }
    if (isDirty) {
      setDiscardDialogOpen(true);

      return;
    }
    closeModal();
  }

  return {
    canAddPart: (state?.parts.length ?? 0) < MAX_PARTS,
    canUndo: isEditing && (state?.parts.length ?? 0) > 1,
    categoryNodes,
    currency,
    errorKey,
    errors: submitted ? errors : {},
    isBlocking,
    isCard,
    isDeleteDialogOpen,
    isDirty,
    isDiscardDialogOpen,
    isEditing,
    isLoading: !state && !(isEditing && existing.error),
    isNotFound: isEditing && !!existing.error,
    isTotalTyped,
    isUndoDialogOpen,
    onAddPart: () =>
      transform((current) => ({
        ...current,
        parts: [
          ...current.parts,
          newPart(netType(current.parts) === "INCOME" ? "EXPENSE" : "EXPENSE"),
        ],
      })),
    onAdjust: () => transform(applyToAdjustment),
    onAdjustmentKindChange: (key: string, discount: boolean) =>
      transform((current) => ({
        ...current,
        parts: current.parts.map((part) =>
          part.key === key
            ? { ...part, cents: (discount ? -1 : 1) * Math.abs(part.cents) }
            : part,
        ),
      })),
    onClose,
    onDateChange: (date?: Date) => date && change({ date }),
    onDeleteCancel: () => setDeleteDialogOpen(false),
    onDeleteConfirm,
    onDeletePress: () => setDeleteDialogOpen(true),
    onDescriptionChange: (text: string) => change({ description: text }),
    onDiscardCancel: () => setDiscardDialogOpen(false),
    onDiscardConfirm: () => closeModal(),
    onNotesChange: (text: string) => change({ notes: text }),
    onPaidChange: (paid: boolean) => change({ paid }),
    onPartCategoryChange: (key: string, categoryId: string) =>
      changePart(key, { categoryId }),
    onPartDescriptionChange: (key: string, description: string) =>
      changePart(key, { description }),
    onPartPick: (key: string) =>
      transform((current) => applyToPart(current, key)),
    onPartRemove: (key: string) =>
      transform((current) => ({
        ...current,
        parts: current.parts.filter((part) => part.key !== key),
      })),
    onPartTagsChange: (key: string, values: string[]) =>
      changePart(key, { tags: values }),
    onPartTypeChange: (key: string, type: "EXPENSE" | "INCOME") =>
      changePart(key, { categoryId: undefined, type }),
    onPartValueChange: (key: string, cents: number) =>
      transform((current) => ({
        ...current,
        parts: current.parts.map((part) =>
          part.key === key
            ? {
                ...part,
                cents:
                  part.adjustment && part.cents < 0 ? -Math.abs(cents) : cents,
              }
            : part,
        ),
      })),
    onSave,
    onSourceChange: (value: string) =>
      transform((current) => ({
        ...current,
        accountId: value.startsWith(ACCOUNT_PREFIX)
          ? value.slice(ACCOUNT_PREFIX.length)
          : undefined,
        creditCardId: value.startsWith(CARD_PREFIX)
          ? value.slice(CARD_PREFIX.length)
          : undefined,
        invoiceMonth: undefined,
        parts: value.startsWith(CARD_PREFIX)
          ? current.parts.map((part) =>
              part.type === "INCOME"
                ? { ...part, categoryId: undefined, type: "EXPENSE" as const }
                : part,
            )
          : current.parts,
      })),
    onTotalPaidChange: (cents: number) => change({ totalPaidCents: cents }),
    onTotalTypePress: () => setTotalTyped(true),
    onUndoCancel: () => setUndoDialogOpen(false),
    onUndoConfirm,
    onUndoPress: () => setUndoDialogOpen(true),
    remainingCents: remaining,
    sourceOptions,
    sourceValue,
    state,
    sumCents,
    tagSuggestions,
  };
}

export default useSplitFormViewModel;
