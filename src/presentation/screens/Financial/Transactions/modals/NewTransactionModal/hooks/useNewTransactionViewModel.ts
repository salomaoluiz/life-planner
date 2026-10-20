import { useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { TextInput } from "react-native";

import CreditCardOverviewDTO from "@application/dto/financial/CreditCardOverviewDTO";
import TagDTO from "@application/dto/financial/TagDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { RecurrenceHasPaidOccurrences } from "@domain/entities/errors";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import { RecurrenceScope } from "@domain/entities/financial/RecurrenceEntity";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import { normalizeCategoryColor } from "@presentation/constants/categoryColors";
import { TranslationKeys } from "@presentation/i18n/types";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";
import { filterRowsByQuery } from "@screens/Financial/models/categoryTree";
import {
  installmentInvoiceRange,
  installmentPreview,
  isValidInstallmentCount,
} from "@screens/Financial/models/installments";
import {
  dueDateOf,
  invoiceMonthOf,
} from "@screens/Financial/models/invoiceMonth";
import { personalOwnerId } from "@screens/Financial/models/ownerOptions";
import {
  RECURRENCE_FREQUENCIES,
  recurrenceLastDate,
  recurrenceOccurrenceCount,
} from "@screens/Financial/models/recurrence";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";
import { decimalStringToCents } from "@utils/money";

import NewTransactionUIModel from "../models/NewTransactionUIModel";
import {
  buildRecurringSave,
  lockedHelperKey,
  recurrenceLocks,
} from "../models/recurrenceEdit";
import {
  changeDate,
  changeInstallmentsOn,
  changeOwner,
  changePaid,
  changePayWith,
  changeRepeatOn,
  changeType,
  chipCategories,
  createInitialState,
  isSameState,
  normalizeDate,
  pickNewRecordId,
  resetForNext,
  stateFromDto,
  toCreateInstallmentParams,
  toCreateParams,
  toCreateRecurrenceParams,
  toUpdateParams,
  TransactionFormState,
  validate,
} from "../models/transactionFormState";

// Live hints of Card mode (spec 029 FR 30): which invoice the purchase lands on, whether it passes
// the limit (non-blocking) and whether that invoice is already paid (blocks saving).
function cardHintsOf(
  state: TransactionFormState | undefined,
  uiModel: NewTransactionUIModel | undefined,
  overview: CreditCardOverviewDTO | undefined,
  existing: TransactionDTO | undefined,
) {
  const none = {
    invoiceHint: undefined,
    isInvoicePaid: false,
    monthDate: undefined,
    overLimitCents: 0,
  };
  const card =
    state?.payWith === "CARD" ? uiModel?.card(state.creditCardId) : undefined;

  if (!state || !card) {
    return none;
  }

  const date = state.date;
  const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const month = invoiceMonthOf(day, card.closingDay);
  const summary = overview?.cards.find((item) => item.card.id === card.id);
  const paid = (summary?.closedInvoices ?? []).some(
    (invoice) => invoice.referenceMonth === month && invoice.status === "PAID",
  );
  // The purchase being edited already counts in `used`: give its value back before comparing.
  const stored =
    existing?.creditCardId === card.id
      ? decimalStringToCents(existing.value)
      : 0;
  const available = summary ? summary.available + stored : undefined;
  const [year, monthNumber] = month.split("-").map(Number);

  return {
    invoiceHint: {
      due: dueDateOf(month, card.closingDay, card.dueDay),
      month,
    },
    isInvoicePaid: paid,
    monthDate: new Date(year, monthNumber - 1, 1),
    overLimitCents:
      available === undefined ? 0 : Math.max(0, state.amountCents - available),
  };
}

async function fetchByOwners<T>(
  owners: OwnerDTO[],
  execute: (ownerIds: string[]) => Promise<T>,
) {
  return execute(owners.map((owner) => owner.id));
}

// The "Installments" block of Card mode (spec 030 FR 1-3, 8.1): count, split preview and first/last invoice.
// Only when creating: an existing purchase is edited as an installment through its own sheet.
function installmentsOf(
  state: TransactionFormState | undefined,
  cardHints: ReturnType<typeof cardHintsOf>,
  isEditing: boolean,
  error: TranslationKeys | undefined,
) {
  const visible = !!state && state.payWith === "CARD" && !isEditing;
  const enabled = visible && !!state && state.installmentsOn;
  const count = state?.installmentsCount ?? 0;
  const valid =
    enabled &&
    isValidInstallmentCount(count) &&
    (state?.amountCents ?? 0) >= count;

  return {
    count,
    countText: count > 0 ? String(count) : "",
    enabled,
    error,
    preview: valid ? installmentPreview(state!.amountCents, count) : undefined,
    range:
      valid && cardHints.invoiceHint
        ? installmentInvoiceRange(cardHints.invoiceHint.month, count)
        : undefined,
    visible,
  };
}

// "12 times, last on 05/09/2027" (with an end date) or "Repeats every month" (without), spec 034 FR 17.
function repeatPreviewOf(state: TransactionFormState | undefined) {
  if (!state || !state.repeatOn) {
    return undefined;
  }
  if (!state.repeatEnd) {
    return { frequency: state.repeatFrequency, kind: "forever" as const };
  }

  const count = recurrenceOccurrenceCount(
    state.date,
    state.repeatEnd,
    state.repeatFrequency,
  );
  const last = recurrenceLastDate(
    state.date,
    state.repeatEnd,
    state.repeatFrequency,
  );

  return last
    ? { count, kind: "times" as const, last }
    : { kind: "none" as const };
}

// Tags of the chosen owner by usage, then name (spec 043 FR 14/15).
function suggestTags(tags: TagDTO[], ownerId?: string) {
  return tags
    .filter((tag) => !!ownerId && tag.scopeOwnerIds.includes(ownerId))
    .sort(
      (a, b) =>
        b.usageCount - a.usageCount ||
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    )
    .map((tag) => ({
      id: tag.id,
      label: tag.name,
      meta: tag.usageCount > 0 ? String(tag.usageCount) : undefined,
    }));
}

function useNewTransactionViewModel() {
  const params = useLocalSearchParams<{
    creditCardId?: string;
    id?: string;
    // A PROJECTED occurrence of a series is opened by series + number + its month (spec 034 FR 16).
    month?: string;
    occurrenceNumber?: string;
    recurrenceId?: string;
  }>();
  const isProjected = !!params.recurrenceId && !params.id;
  const isEditing = !!params.id || isProjected;
  const isFocused = useIsFocused();

  const owners = useActiveOwners();
  const accounts = useQuery({
    cacheKey: [useCases.getFinancialAccountsUseCase.uniqueName],
    enabled: !!owners.data,
    fetch: async () =>
      fetchByOwners(owners.data!, useCases.getFinancialAccountsUseCase.execute),
  });
  const cards = useQuery({
    cacheKey: [useCases.getFinancialCreditCardsUseCase.uniqueName],
    enabled: !!owners.data,
    fetch: async () =>
      fetchByOwners(
        owners.data!,
        useCases.getFinancialCreditCardsUseCase.execute,
      ),
  });
  // The overview carries the available limit and the paid invoices used by the live hints.
  const overview = useQuery({
    cacheKey: [useCases.getFinancialCreditCardsOverviewUseCase.uniqueName],
    enabled: !!owners.data,
    fetch: async () =>
      fetchByOwners(
        owners.data!,
        useCases.getFinancialCreditCardsOverviewUseCase.execute,
      ),
  });
  const categories = useQuery({
    cacheKey: [useCases.getFinancialCategoriesUseCase.uniqueName],
    enabled: !!owners.data,
    fetch: async () =>
      fetchByOwners(
        owners.data!,
        useCases.getFinancialCategoriesUseCase.execute,
      ),
  });
  // Suggestions of the Tags field. A failed load is not an error: the field still creates tags (FR 20).
  const tags = useQuery({
    cacheKey: [useCases.getFinancialTagsUseCase.uniqueName],
    enabled: !!owners.data,
    fetch: async () =>
      fetchByOwners(owners.data!, useCases.getFinancialTagsUseCase.execute),
  });
  const transactions = useQuery({
    cacheKey: [useCases.getFinancialTransactionsUseCase.uniqueName],
    enabled: isEditing && !!owners.data,
    fetch: async () =>
      useCases.getFinancialTransactionsUseCase.execute({
        ownerIds: owners.data!.map((owner) => owner.id),
      }),
  });

  const projections = useQuery({
    cacheKey: [
      useCases.getFinancialProjectionsUseCase.uniqueName,
      params.month ?? "",
    ],
    enabled: isProjected && !!params.month && !!owners.data,
    fetch: async () =>
      useCases.getFinancialProjectionsUseCase.execute({
        from: params.month!,
        ownerIds: owners.data!.map((owner) => owner.id),
        to: params.month!,
      }),
  });

  const uiModel = useMemo(
    () =>
      owners.data && accounts.data && categories.data
        ? new NewTransactionUIModel({
            accounts: accounts.data,
            cards: cards.data,
            categories: categories.data,
            owners: owners.data,
          })
        : undefined,
    [owners.data, accounts.data, cards.data, categories.data],
  );

  const projectedExisting = projections.data
    ?.find(
      (item) =>
        item.recurrenceId === params.recurrenceId &&
        item.occurrenceNumber === Number(params.occurrenceNumber),
    )
    ?.toTransactionDTO();
  const existing = isProjected
    ? projectedExisting
    : transactions.data?.find((item) => item.id === params.id);
  const isRecurring = isEditing && !!existing?.recurrenceId;
  // The series (end date, frequency) of the occurrence being edited.
  const seriesList = useQuery({
    cacheKey: [useCases.getFinancialRecurrencesUseCase.uniqueName],
    enabled: isRecurring && !!owners.data,
    fetch: async () =>
      useCases.getFinancialRecurrencesUseCase.execute({
        ownerIds: owners.data!.map((owner) => owner.id),
      }),
  });
  const series = seriesList.data?.find(
    (item) => item.id === existing?.recurrenceId,
  );
  const isSeriesMissing = isRecurring && !!seriesList.data && !series;
  const isNotFound =
    (isProjected
      ? !!projections.data && !projectedExisting
      : isEditing && !!transactions.data && !existing) || isSeriesMissing;
  // An installment is edited through its own sheet (spec 030): hand over instead of opening this form.
  const isInstallment = isEditing && !!existing?.installmentPlanId;
  // The account debit row of an early payment is edited on the card (spec 032 FR 35): hand over as well.
  const earlyPayment = isEditing ? existing?.earlyPayment : undefined;
  // A card purchase can be refunded from its own sheet (spec 032 FR 21).
  const canRefund =
    isEditing &&
    !!existing?.creditCardId &&
    !existing.installmentPlanId &&
    existing.type === "EXPENSE" &&
    !existing.systemKey;

  useEffect(() => {
    if (isInstallment) {
      router.replace({
        params: { id: params.id },
        pathname: "/financial/installment/edit_installment",
      } as never);
    }
  }, [isInstallment]);

  useEffect(() => {
    if (earlyPayment) {
      router.replace({
        params: {
          creditCardId: earlyPayment.creditCardId,
          id: earlyPayment.id,
          invoiceMonth: earlyPayment.invoiceMonth,
        },
        pathname: "/financial/early_payment/card_early_payment",
      } as never);
    }
  }, [earlyPayment?.id]);

  const initial = useMemo(() => {
    if (!uiModel || !owners.data || !accounts.data) {
      return undefined;
    }
    if (isEditing) {
      if (!existing || (existing.recurrenceId && !series)) {
        return undefined;
      }

      return stateFromDto(existing, series);
    }

    return createInitialState({
      accounts: accounts.data,
      card: uiModel.card(params.creditCardId),
      now: new Date(),
      ownerId: personalOwnerId(owners.data) ?? owners.data[0].id,
    });
  }, [
    uiModel,
    owners.data,
    accounts.data,
    isEditing,
    existing,
    series,
    params.creditCardId,
  ]);

  const [edited, setEdited] = useState<TransactionFormState>();
  // Spec 039: after "Save and add another" the reset form is the new baseline, so closing it untouched is not "dirty".
  const [baseline, setBaseline] = useState<TransactionFormState>();
  const [isSaved, setSaved] = useState(false);
  // What the success of the running save does: leave the modal, or reset it for the next transaction.
  const saveIntent = useRef<"close" | "next">("close");
  const amountInputRef = useRef<TextInput>(null);
  // Which occurrences an edit of a recurring row reaches (spec 034 FR 19); changing it starts from the stored values.
  const [scope, setScope] = useState<RecurrenceScope>("ONLY_THIS");
  const [deleteScope, setDeleteScope] = useState<RecurrenceScope>("ONLY_THIS");
  const [isAllDeleteOpen, setAllDeleteOpen] = useState(false);
  const [isPaidDeleteDismissed, setPaidDeleteDismissed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isDiscardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isCategoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [pendingCreate, setPendingCreate] = useState<"account" | "category">();
  const knownIds = useRef<string[]>([]);

  const state = edited ?? initial;
  const reference = baseline ?? initial;
  const isDirty = !!edited && !!reference && !isSameState(edited, reference);

  const mostUsed = useQuery({
    cacheKey: [
      useCases.getMostUsedFinancialCategoriesUseCase.uniqueName,
      state?.ownerId ?? "",
      state?.type ?? "",
    ],
    enabled: !!state,
    fetch: async () =>
      useCases.getMostUsedFinancialCategoriesUseCase.execute({
        ownerId: state!.ownerId,
        type: state!.type,
      }),
  });

  const createMutation = useMutation({
    cacheKey: [useCases.createFinancialTransactionUseCase.uniqueName],
    fetch: useCases.createFinancialTransactionUseCase.execute,
  });
  const createPlanMutation = useMutation({
    cacheKey: [useCases.createFinancialInstallmentPlanUseCase.uniqueName],
    fetch: useCases.createFinancialInstallmentPlanUseCase.execute,
  });
  const updateMutation = useMutation({
    cacheKey: [useCases.updateFinancialTransactionUseCase.uniqueName],
    fetch: useCases.updateFinancialTransactionUseCase.execute,
  });
  const deleteMutation = useMutation({
    cacheKey: [useCases.deleteFinancialTransactionUseCase.uniqueName],
    fetch: useCases.deleteFinancialTransactionUseCase.execute,
  });
  const createRecurrenceMutation = useMutation({
    cacheKey: [useCases.createFinancialRecurrenceUseCase.uniqueName],
    fetch: useCases.createFinancialRecurrenceUseCase.execute,
  });
  const updateRecurrenceMutation = useMutation({
    cacheKey: [useCases.updateFinancialRecurrenceUseCase.uniqueName],
    fetch: useCases.updateFinancialRecurrenceUseCase.execute,
  });
  const splitRecurrenceMutation = useMutation({
    cacheKey: [useCases.splitFinancialRecurrenceUseCase.uniqueName],
    fetch: useCases.splitFinancialRecurrenceUseCase.execute,
  });
  const materializeMutation = useMutation({
    cacheKey: [useCases.materializeFinancialOccurrenceUseCase.uniqueName],
    fetch: useCases.materializeFinancialOccurrenceUseCase.execute,
  });
  const deleteOccurrenceMutation = useMutation({
    cacheKey: [useCases.deleteFinancialOccurrenceUseCase.uniqueName],
    fetch: useCases.deleteFinancialOccurrenceUseCase.execute,
  });
  const deleteRecurrenceMutation = useMutation({
    cacheKey: [useCases.deleteFinancialRecurrenceUseCase.uniqueName],
    fetch: useCases.deleteFinancialRecurrenceUseCase.execute,
  });
  const mutations = [
    createMutation,
    createPlanMutation,
    updateMutation,
    deleteMutation,
    createRecurrenceMutation,
    updateRecurrenceMutation,
    splitRecurrenceMutation,
    materializeMutation,
    deleteOccurrenceMutation,
    deleteRecurrenceMutation,
  ];

  useEffect(() => {
    if (!mutations.some((mutation) => mutation.status === "success")) {
      return;
    }
    if (saveIntent.current === "next" && state) {
      const next = resetForNext(state);

      saveIntent.current = "close";
      setEdited(next);
      setBaseline(next);
      setSubmitted(false);
      setSaved(true);
      // Back to idle, so the next success is detected again.
      mutations.forEach((mutation) => mutation.reset());
      amountInputRef.current?.focus();
      // Tags created by the save show up as suggestions for the next entry.
      tags.refetch();

      return;
    }
    router.back();
  }, [mutations.map((mutation) => mutation.status).join(",")]);

  // Records created in the stacked create sheet appear on return: refetch on focus.
  useEffect(() => {
    if (isFocused) {
      accounts.refetch();
      cards.refetch();
      overview.refetch();
      categories.refetch();
    }
  }, [isFocused]);

  // Select the account / category that was just created from the inline hint.
  useEffect(() => {
    if (!pendingCreate || !uiModel || !state) {
      return;
    }
    const current =
      pendingCreate === "account"
        ? (accounts.data ?? []).filter((item) => item.ownerId === state.ownerId)
        : uiModel.categoriesFor(state.ownerId, state.type);
    const id = pickNewRecordId(knownIds.current, current);

    if (id) {
      setEdited(
        pendingCreate === "account"
          ? { ...state, accountId: id }
          : { ...state, categoryId: id },
      );
      setPendingCreate(undefined);
    }
  }, [accounts.data, categories.data]);

  const errors = submitted && state ? validate(state) : {};
  const cardHints = cardHintsOf(state, uiModel, overview.data, existing);
  const mutationError = mutations.find((mutation) => mutation.error)?.error;
  // Deleting paid occurrences needs a second, explicit confirmation (spec 034 FR 31).
  const paidConflict =
    (deleteRecurrenceMutation.error ??
      deleteOccurrenceMutation.error) instanceof RecurrenceHasPaidOccurrences
      ? (deleteRecurrenceMutation.error ?? deleteOccurrenceMutation.error)
      : undefined;
  const formErrorKey = paidConflict
    ? undefined
    : getFinancialErrorMessageKey(mutationError);
  const locks = recurrenceLocks(scope);

  function update(next: TransactionFormState) {
    setEdited(next);
  }

  function onSave() {
    saveIntent.current = "close";
    submit();
  }

  function onSaveAndNew() {
    if (isEditing || isProjected) {
      return;
    }
    saveIntent.current = "next";
    if (!submit()) {
      saveIntent.current = "close";
    }
  }

  // Returns false when nothing was sent (invalid form).
  function submit() {
    setSubmitted(true);
    if (
      !state ||
      !uiModel ||
      cardHints.isInvoicePaid ||
      Object.keys(validate(state)).length
    ) {
      return false;
    }
    const owner = uiModel.owner(state.ownerId);
    const categoryName = uiModel.categoryName(state.categoryId);

    if (isRecurring && initial && existing) {
      saveRecurring(state, initial, existing);
    } else if (isEditing) {
      updateMutation.mutate(
        toUpdateParams(params.id!, state, owner, categoryName),
      );
    } else if (state.payWith === "CARD" && state.installmentsOn) {
      createPlanMutation.mutate(toCreateInstallmentParams(state, owner));
    } else if (state.repeatOn) {
      createRecurrenceMutation.mutate(toCreateRecurrenceParams(state, owner));
    } else {
      createMutation.mutate(toCreateParams(state, owner, categoryName));
    }

    return true;
  }

  // Spec 034 FR 19-23: the scope decides which endpoint takes the change.
  function saveRecurring(
    current: TransactionFormState,
    stored: TransactionFormState,
    row: TransactionDTO,
  ) {
    const request = buildRecurringSave(scope, current, stored, {
      isCard: !!row.creditCardId,
      isProjected,
      occurrenceNumber: row.occurrenceNumber!,
      recurrenceId: row.recurrenceId!,
      transactionId: isProjected ? undefined : row.id,
    });

    switch (request.kind) {
      case "materialize":
        materializeMutation.mutate(request.params);
        break;
      case "none":
        router.back();
        break;
      case "split":
        splitRecurrenceMutation.mutate(request.params);
        break;
      case "update-series":
        updateRecurrenceMutation.mutate(request.params);
        break;
      case "update-transaction":
        updateMutation.mutate(request.params);
        break;
    }
  }

  function onScopeChange(value: string) {
    setScope(value as RecurrenceScope);
    setEdited(undefined);
  }

  // Delete of a recurring occurrence: "All" asks first; paid occurrences ask again (FR 31).
  function onRecurrenceDelete(confirmPaid = false) {
    if (!existing?.recurrenceId) {
      return;
    }

    setPaidDeleteDismissed(false);
    setAllDeleteOpen(false);
    setDeleteDialogOpen(false);

    if (deleteScope === "ALL") {
      deleteRecurrenceMutation.mutate({
        confirmPaid,
        id: existing.recurrenceId,
      });

      return;
    }

    deleteOccurrenceMutation.mutate({
      confirmPaid,
      occurrenceNumber: existing.occurrenceNumber!,
      recurrenceId: existing.recurrenceId,
      scope: deleteScope,
    });
  }

  function onRecurrenceDeletePress() {
    if (deleteScope === "ALL") {
      setDeleteDialogOpen(false);
      setAllDeleteOpen(true);

      return;
    }

    onRecurrenceDelete();
  }

  function onClose() {
    if (isDirty) {
      setDiscardDialogOpen(true);
      return;
    }
    router.back();
  }

  function onDeleteConfirm() {
    setDeleteDialogOpen(false);
    deleteMutation.mutate({ id: params.id!, ownerId: state!.ownerId });
  }

  function onCreateAccountPress() {
    knownIds.current = uiModel!.accountIds(state!.ownerId);
    setPendingCreate("account");
    router.push({
      params: { ownerId: state!.ownerId },
      pathname: "/financial/account/add_new_account",
    } as never);
  }

  function onCreateCategoryPress() {
    knownIds.current = uiModel!.categoryIds(state!.ownerId, state!.type);
    setPendingCreate("category");
    router.push({
      params: { ownerId: state!.ownerId, type: state!.type },
      pathname: "/financial/category/add_new_category",
    } as never);
  }

  const installments = installmentsOf(
    state,
    cardHints,
    isEditing,
    errors.installments,
  );
  const ownerId = state?.ownerId ?? "";
  const type = state?.type ?? TransactionType.EXPENSE;
  const categoryChips = uiModel
    ? chipCategories(
        (mostUsed.data ?? []).filter(
          (category) => category.status !== "ARCHIVED",
        ),
        state?.categoryId,
        uiModel.categoriesFor(ownerId, type, state?.categoryId),
      ).map((category) => ({
        colorDot: normalizeCategoryColor(category.iconColor),
        label: category.name,
        value: category.id,
      }))
    : [];

  let saveLabelKey: TranslationKeys = "financial.common.saveChanges";
  if (!isEditing) {
    saveLabelKey =
      type === TransactionType.EXPENSE
        ? "financial.transactions.form.saveExpense"
        : "financial.transactions.form.saveIncome";
  }

  const isSaving =
    createMutation.isFetching ||
    createPlanMutation.isFetching ||
    updateMutation.isFetching ||
    createRecurrenceMutation.isFetching ||
    updateRecurrenceMutation.isFetching ||
    splitRecurrenceMutation.isFetching ||
    materializeMutation.isFetching;

  // The amount is in the currency of the chosen account or card (spec 040); it is never typed.
  const currency =
    (state?.payWith === "CARD"
      ? cards.data?.find((card) => card.id === state.creditCardId)?.currency
      : accounts.data?.find((account) => account.id === state?.accountId)
          ?.currency) ?? DEFAULT_CURRENCY;

  // Tags usable in the chosen owner, most used first (the order the API gives for one owner).
  const tagSuggestions = suggestTags(tags.data ?? [], state?.ownerId);

  return {
    accountError: errors.accountId,
    accountOptions: uiModel?.accountOptions(ownerId, state?.accountId) ?? [],
    amountCents: state?.amountCents ?? 0,
    amountError: errors.amount,
    amountInputRef,
    canRefund,
    canSaveAndNew: !isEditing && !isProjected,
    cardError: errors.creditCardId,
    cardOptions: uiModel?.cardOptions(ownerId, state?.creditCardId) ?? [],
    categoryChips,
    categoryError: errors.categoryId,
    categoryPickerRows: uiModel
      ? filterRowsByQuery(
          uiModel.categoryRows(ownerId, type, state?.categoryId),
          categoryQuery,
        )
      : [],
    categoryQuery,
    currency,
    date: state?.date ?? normalizeDate(new Date()),
    dateError: errors.date,
    dateLabelKey: (isEditing && state?.payWith !== "CARD" && state?.paid
      ? "financial.transactions.form.paymentDate"
      : "financial.transactions.form.date") as TranslationKeys,
    description: state?.description ?? "",
    descriptionError: errors.description,
    formErrorKey,
    hasCards:
      (cards.data ?? []).some((card) => card.status === "ACTIVE") ||
      state?.payWith === "CARD",
    hasNoAccounts: uiModel ? !uiModel.hasAccounts(ownerId) : false,
    hasNoCards: uiModel ? !uiModel.hasCards(ownerId) : false,
    hasNoCategories: uiModel ? !uiModel.hasCategories(ownerId, type) : false,
    installments,
    invoiceHint: cardHints.invoiceHint,
    invoiceMonthLabelDate: cardHints.monthDate,
    isCategoryPickerOpen,
    isDeleteDialogOpen,
    isDeleting:
      deleteMutation.isFetching ||
      deleteOccurrenceMutation.isFetching ||
      deleteRecurrenceMutation.isFetching,
    isDiscardDialogOpen,
    isEditing,
    isInvoicePaid: cardHints.isInvoicePaid,
    isLoading: (!state && !isNotFound) || isInstallment || !!earlyPayment,
    isNotFound,
    isSaved,
    isSaveDisabled: cardHints.isInvoicePaid,
    isSaving,
    isSavingNext: isSaving && saveIntent.current === "next",
    onAccountChange: (id: string) => {
      if (state) {
        update({ ...state, accountId: id });
      }
    },
    onAmountChange: (cents: number) => {
      if (state) {
        update({ ...state, amountCents: cents });
      }
    },
    onCardChange: (id: string) => {
      if (state) {
        update({ ...state, creditCardId: id });
      }
    },
    onCategoryPickerClose: () => setCategoryPickerOpen(false),
    onCategoryPickerOpen: () => {
      setCategoryQuery("");
      setCategoryPickerOpen(true);
    },
    onCategoryQueryChange: setCategoryQuery,
    onCategorySelect: (id: string) => {
      if (state) {
        update({ ...state, categoryId: id });
      }
      setCategoryPickerOpen(false);
    },
    onClose,
    onCreateAccountPress,
    onCreateCategoryPress,
    onDateChange: (date: Date) => {
      if (state) {
        update(changeDate(state, date, isEditing));
      }
    },
    onDeleteCancel: () => setDeleteDialogOpen(false),
    onDeleteConfirm,
    onDeletePress: () => setDeleteDialogOpen(true),
    onDescriptionChange: (text: string) => {
      if (state) {
        update({ ...state, description: text });
      }
    },
    onDiscardCancel: () => setDiscardDialogOpen(false),
    onDiscardConfirm: () => router.back(),
    onInstallmentsCountChange: (text: string) => {
      if (state) {
        update({
          ...state,
          installmentsCount: Number(text.replace(/\D/g, "")) || 0,
        });
      }
    },
    onInstallmentsToggle: (on: boolean) => {
      if (state) {
        update(changeInstallmentsOn(state, on));
      }
    },
    onOwnerChange: (id: string) => {
      if (state) {
        update(
          changeOwner(
            state,
            id,
            categories.data ?? [],
            accounts.data ?? [],
            cards.data ?? [],
          ),
        );
      }
    },
    onPaidChange: (paid: boolean) => {
      if (state) {
        update(changePaid(state, paid, isEditing));
      }
    },
    onPayWithChange: (value: string) => {
      if (state) {
        update(
          changePayWith(
            state,
            value === "CARD" ? "CARD" : "ACCOUNT",
            categories.data ?? [],
            cards.data ?? [],
          ),
        );
      }
    },
    onRecurrenceDeleteCancel: () => {
      setAllDeleteOpen(false);
      setPaidDeleteDismissed(true);
    },
    onRecurrenceDeleteConfirm: () => onRecurrenceDelete(),
    onRecurrenceDeletePaidConfirm: () => onRecurrenceDelete(true),
    onRecurrenceDeletePress,
    onRecurrenceDeleteScopeChange: (value: string) =>
      setDeleteScope(value as RecurrenceScope),
    onRefundPress: () => {
      if (existing?.creditCardId) {
        router.replace({
          params: {
            creditCardId: existing.creditCardId,
            refundedTransactionId: existing.id,
          },
          pathname: "/financial/refund/card_refund",
        } as never);
      }
    },
    onRepeatEndChange: (date?: Date) => {
      if (state) {
        update({ ...state, repeatEnd: date ? normalizeDate(date) : undefined });
      }
    },
    onRepeatFrequencyChange: (value: string) => {
      const frequency = RECURRENCE_FREQUENCIES.find((item) => item === value);

      if (state && frequency) {
        update({ ...state, repeatFrequency: frequency });
      }
    },
    onRepeatToggle: (on: boolean) => {
      if (state) {
        update(changeRepeatOn(state, on));
      }
    },
    onSave,
    onSaveAndNew,
    onSavedHide: () => setSaved(false),
    onScopeChange,
    onTagsChange: (next: string[]) => {
      if (state) {
        setEdited({ ...state, tags: next });
      }
    },
    onTypeChange: (next: TransactionType) => {
      if (state) {
        update(changeType(state, next, categories.data ?? []));
      }
    },
    overLimitCents: cardHints.overLimitCents,
    ownerChoices: uiModel?.ownerChoices ?? [],
    ownerId,
    paid: state?.paid ?? true,
    paidConflict:
      paidConflict && !isPaidDeleteDismissed
        ? (paidConflict as RecurrenceHasPaidOccurrences)
        : undefined,
    // Create + future date + off: tell why the switch starts off. Edit: the date is the payment day once paid.
    paidHelpKey: (isEditing
      ? "financial.transactions.form.paidHelpEdit"
      : "financial.transactions.form.paidHelpCreate") as TranslationKeys,
    paidHintKey:
      !isEditing &&
      state &&
      !state.paid &&
      state.date > normalizeDate(new Date())
        ? ("financial.transactions.form.paidHintFuture" as TranslationKeys)
        : undefined,
    paidLabelKey: (type === TransactionType.EXPENSE
      ? "financial.transactions.form.paid"
      : "financial.transactions.form.received") as TranslationKeys,
    payWith: state?.payWith ?? "ACCOUNT",
    recurrence: {
      // Create: the "Repeat" switch. Edit: the series of the occurrence, with the scope selector (FR 17, 19).
      deleteScope,
      endError: errors.repeatEnd,
      endHelperKey: isRecurring
        ? lockedHelperKey(locks.endDate, "endDate")
        : undefined,
      frequencyHelperKey: isRecurring
        ? lockedHelperKey(locks.frequency, "frequency")
        : undefined,
      isAllDeleteOpen,
      isEndLocked: isRecurring && locks.endDate,
      isFrequencyLocked: isRecurring && locks.frequency,
      isRecurring,
      isRepeatToggleVisible: !isEditing,
      preview: repeatPreviewOf(state),
      scope,
    },
    repeatEnd: state?.repeatEnd,
    repeatFrequency: state?.repeatFrequency ?? "MONTHLY",
    repeatOn: state?.repeatOn ?? false,
    saveLabelKey,
    scopeLocks: isRecurring
      ? {
          account: locks.account,
          accountHelperKey: lockedHelperKey(locks.account, "account"),
          date: locks.date,
          dateHelperKey: lockedHelperKey(locks.date, "date"),
          paid: locks.paid,
        }
      : undefined,
    selectedAccountId: state?.accountId,
    selectedCardId: state?.creditCardId,
    selectedCategoryId: state?.categoryId,
    // Card purchases follow their invoice: no switch (spec 033 FR 19).
    showPaid: state?.payWith !== "CARD",
    tags: state?.tags ?? [],
    tagSuggestions,
    titleKey: (isEditing
      ? "financial.transactions.form.editTitle"
      : "financial.transactions.form.newTitle") as TranslationKeys,
    type,
    typeOptions: uiModel?.typeOptions ?? [],
    typeTone: (type === TransactionType.EXPENSE ? "expense" : "income") as
      | "expense"
      | "income",
  };
}

export default useNewTransactionViewModel;
