import { useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

import CreditCardOverviewDTO from "@application/dto/financial/CreditCardOverviewDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import { normalizeCategoryColor } from "@presentation/constants/categoryColors";
import { TranslationKeys } from "@presentation/i18n/types";
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
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";
import { decimalStringToCents } from "@utils/money";

import NewTransactionUIModel from "../models/NewTransactionUIModel";
import {
  changeOwner,
  changePayWith,
  changeType,
  chipCategories,
  createInitialState,
  isSameState,
  normalizeDate,
  pickNewRecordId,
  stateFromDto,
  toCreateInstallmentParams,
  toCreateParams,
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

function useNewTransactionViewModel() {
  const params = useLocalSearchParams<{ creditCardId?: string; id?: string }>();
  const isEditing = !!params.id;
  const isFocused = useIsFocused();

  const owners = useQuery({
    cacheKey: [useCases.getOwnersUseCase.uniqueName],
    fetch: useCases.getOwnersUseCase.execute,
  });
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
  const transactions = useQuery({
    cacheKey: [useCases.getFinancialTransactionsUseCase.uniqueName],
    enabled: isEditing && !!owners.data,
    fetch: async () =>
      useCases.getFinancialTransactionsUseCase.execute({
        ownerIds: owners.data!.map((owner) => owner.id),
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

  const existing = transactions.data?.find((item) => item.id === params.id);
  const isNotFound = isEditing && !!transactions.data && !existing;

  const initial = useMemo(() => {
    if (!uiModel || !owners.data || !accounts.data) {
      return undefined;
    }
    if (isEditing) {
      return existing ? stateFromDto(existing) : undefined;
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
    params.creditCardId,
  ]);

  const [edited, setEdited] = useState<TransactionFormState>();
  const [submitted, setSubmitted] = useState(false);
  const [isDiscardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isCategoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [pendingCreate, setPendingCreate] = useState<"account" | "category">();
  const knownIds = useRef<string[]>([]);

  const state = edited ?? initial;
  const isDirty = !!edited && !!initial && !isSameState(edited, initial);

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

  useEffect(() => {
    if (
      createMutation.status === "success" ||
      createPlanMutation.status === "success" ||
      updateMutation.status === "success" ||
      deleteMutation.status === "success"
    ) {
      router.back();
    }
  }, [
    createMutation.status,
    createPlanMutation.status,
    updateMutation.status,
    deleteMutation.status,
  ]);

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
  const formErrorKey = getFinancialErrorMessageKey(
    createMutation.error ??
      createPlanMutation.error ??
      updateMutation.error ??
      deleteMutation.error,
  );

  function update(next: TransactionFormState) {
    setEdited(next);
  }

  function onSave() {
    setSubmitted(true);
    if (
      !state ||
      !uiModel ||
      cardHints.isInvoicePaid ||
      Object.keys(validate(state)).length
    ) {
      return;
    }
    const owner = uiModel.owner(state.ownerId);
    const categoryName = uiModel.categoryName(state.categoryId);

    if (isEditing) {
      updateMutation.mutate(
        toUpdateParams(params.id!, state, owner, categoryName),
      );
    } else if (state.payWith === "CARD" && state.installmentsOn) {
      createPlanMutation.mutate(toCreateInstallmentParams(state, owner));
    } else {
      createMutation.mutate(toCreateParams(state, owner, categoryName));
    }
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
        mostUsed.data ?? [],
        state?.categoryId,
        uiModel.categoriesFor(ownerId, type),
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

  return {
    accountError: errors.accountId,
    accountOptions: uiModel?.accountOptions(ownerId, state?.accountId) ?? [],
    amountCents: state?.amountCents ?? 0,
    amountError: errors.amount,
    cardError: errors.creditCardId,
    cardOptions: uiModel?.cardOptions(ownerId, state?.creditCardId) ?? [],
    categoryChips,
    categoryError: errors.categoryId,
    categoryPickerRows: uiModel
      ? filterRowsByQuery(uiModel.categoryRows(ownerId, type), categoryQuery)
      : [],
    categoryQuery,
    date: state?.date ?? normalizeDate(new Date()),
    dateError: errors.date,
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
    isDeleting: deleteMutation.isFetching,
    isDiscardDialogOpen,
    isEditing,
    isInvoicePaid: cardHints.isInvoicePaid,
    isLoading: !state && !isNotFound,
    isNotFound,
    isSaveDisabled: cardHints.isInvoicePaid,
    isSaving:
      createMutation.isFetching ||
      createPlanMutation.isFetching ||
      updateMutation.isFetching,
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
        update({ ...state, date: normalizeDate(date) });
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
        update({ ...state, installmentsOn: on });
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
    onSave,
    onTypeChange: (next: TransactionType) => {
      if (state) {
        update(changeType(state, next, categories.data ?? []));
      }
    },
    overLimitCents: cardHints.overLimitCents,
    ownerChoices: uiModel?.ownerChoices ?? [],
    ownerId,
    payWith: state?.payWith ?? "ACCOUNT",
    saveLabelKey,
    selectedAccountId: state?.accountId,
    selectedCardId: state?.creditCardId,
    selectedCategoryId: state?.categoryId,
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
