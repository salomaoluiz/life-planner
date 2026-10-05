import { useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import { normalizeCategoryColor } from "@presentation/constants/categoryColors";
import { TranslationKeys } from "@presentation/i18n/types";
import { filterRowsByQuery } from "@screens/Financial/models/categoryTree";
import { personalOwnerId } from "@screens/Financial/models/ownerOptions";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";

import NewTransactionUIModel from "../models/NewTransactionUIModel";
import {
  changeOwner,
  changeType,
  chipCategories,
  createInitialState,
  isSameState,
  normalizeDate,
  pickNewRecordId,
  stateFromDto,
  toCreateParams,
  toUpdateParams,
  TransactionFormState,
  validate,
} from "../models/transactionFormState";

async function fetchByOwners<T>(
  owners: OwnerDTO[],
  execute: (ownerIds: string[]) => Promise<T>,
) {
  return execute(owners.map((owner) => owner.id));
}

function useNewTransactionViewModel() {
  const params = useLocalSearchParams<{ id?: string }>();
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
            categories: categories.data,
            owners: owners.data,
          })
        : undefined,
    [owners.data, accounts.data, categories.data],
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
      now: new Date(),
      ownerId: personalOwnerId(owners.data) ?? owners.data[0].id,
    });
  }, [uiModel, owners.data, accounts.data, isEditing, existing]);

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
      updateMutation.status === "success" ||
      deleteMutation.status === "success"
    ) {
      router.back();
    }
  }, [createMutation.status, updateMutation.status, deleteMutation.status]);

  // Records created in the stacked create sheet appear on return: refetch on focus.
  useEffect(() => {
    if (isFocused) {
      accounts.refetch();
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
  const formErrorKey = getFinancialErrorMessageKey(
    createMutation.error ?? updateMutation.error ?? deleteMutation.error,
  );

  function update(next: TransactionFormState) {
    setEdited(next);
  }

  function onSave() {
    setSubmitted(true);
    if (!state || !uiModel || Object.keys(validate(state)).length) {
      return;
    }
    const owner = uiModel.owner(state.ownerId);
    const categoryName = uiModel.categoryName(state.categoryId);

    if (isEditing) {
      updateMutation.mutate(
        toUpdateParams(params.id!, state, owner, categoryName),
      );
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
    accountOptions: uiModel?.accountOptions(ownerId) ?? [],
    amountCents: state?.amountCents ?? 0,
    amountError: errors.amount,
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
    hasNoAccounts: uiModel ? !uiModel.hasAccounts(ownerId) : false,
    hasNoCategories: uiModel ? !uiModel.hasCategories(ownerId, type) : false,
    isCategoryPickerOpen,
    isDeleteDialogOpen,
    isDeleting: deleteMutation.isFetching,
    isDiscardDialogOpen,
    isEditing,
    isLoading: !state && !isNotFound,
    isNotFound,
    isSaving: createMutation.isFetching || updateMutation.isFetching,
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
    onOwnerChange: (id: string) => {
      if (state) {
        update(
          changeOwner(state, id, categories.data ?? [], accounts.data ?? []),
        );
      }
    },
    onSave,
    onTypeChange: (next: TransactionType) => {
      if (state) {
        update(changeType(state, next, categories.data ?? []));
      }
    },
    ownerChoices: uiModel?.ownerChoices ?? [],
    ownerId,
    saveLabelKey,
    selectedAccountId: state?.accountId,
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
