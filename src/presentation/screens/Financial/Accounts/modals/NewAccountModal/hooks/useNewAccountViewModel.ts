import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import { TranslationKeys } from "@presentation/i18n/types";
import {
  ACTIVE_OWNERS_CACHE_KEY,
  fetchActiveOwners,
} from "@screens/Financial/models/activeOwners";
import { personalOwnerId } from "@screens/Financial/models/ownerOptions";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";

import {
  AccountChanges,
  AccountFormState,
  createInitialState,
  isSameState,
  stateFromDto,
  toCreateParams,
  toUpdateParams,
  validate,
} from "../models/accountFormState";
import NewAccountUIModel from "../models/NewAccountUIModel";

async function fetchByOwners<T>(
  owners: OwnerDTO[],
  execute: (ownerIds: string[]) => Promise<T>,
) {
  return execute(owners.map((owner) => owner.id));
}

// The balance is no longer a field of the account: changing it records an adjustment transaction.
// Archiving adjusts first (an archived account refuses adjustments); reactivating patches first.
// The adjustment targets a balance, so repeating a half-failed save is safe.
async function saveAccountChanges({ balance, ...fields }: AccountChanges) {
  async function patch() {
    if (Object.keys(fields).length > 1) {
      await useCases.updateFinancialAccountUseCase.execute(fields);
    }
  }
  async function adjust() {
    if (balance !== undefined) {
      await useCases.adjustFinancialAccountBalanceUseCase.execute({
        balance,
        id: fields.id,
      });
    }
  }

  if (fields.status === "ACTIVE") {
    await patch();
    await adjust();

    return;
  }

  await adjust();
  await patch();
}

function useNewAccountViewModel() {
  const params = useLocalSearchParams<{ id?: string; ownerId?: string }>();
  const isEditing = !!params.id;

  const owners = useQuery({
    cacheKey: ACTIVE_OWNERS_CACHE_KEY,
    fetch: fetchActiveOwners,
  });
  const accounts = useQuery({
    cacheKey: [useCases.getFinancialAccountsUseCase.uniqueName],
    enabled: !!owners.data,
    fetch: async () =>
      fetchByOwners(owners.data!, useCases.getFinancialAccountsUseCase.execute),
  });

  const existing = accounts.data?.find((item) => item.id === params.id);
  const isNotFound = isEditing && !!accounts.data && !existing;

  const uiModel = useMemo(
    () =>
      owners.data && accounts.data
        ? new NewAccountUIModel({
            accounts: accounts.data,
            owners: owners.data,
          })
        : undefined,
    [owners.data, accounts.data],
  );

  const initial = useMemo(() => {
    if (!owners.data || !accounts.data) {
      return undefined;
    }
    if (isEditing) {
      return existing ? stateFromDto(existing) : undefined;
    }

    return createInitialState({
      ownerId:
        params.ownerId ?? personalOwnerId(owners.data) ?? owners.data[0].id,
    });
  }, [owners.data, accounts.data, isEditing, existing, params.ownerId]);

  // The recurring series that end when the account is archived (spec 034 FR 34).
  const series = useQuery({
    cacheKey: [
      useCases.getFinancialRecurrencesUseCase.uniqueName,
      "account",
      params.id ?? "",
    ],
    enabled: isEditing && !!existing && existing.status !== "ARCHIVED",
    fetch: async () =>
      useCases.getFinancialRecurrencesUseCase.execute({
        accountId: params.id,
        ownerIds: [existing!.ownerId],
        status: "ACTIVE",
      }),
  });

  const [edited, setEdited] = useState<AccountFormState>();
  const [submitted, setSubmitted] = useState(false);
  const [isDiscardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const state = edited ?? initial;
  const isDirty = !!edited && !!initial && !isSameState(edited, initial);

  const createMutation = useMutation({
    cacheKey: [useCases.createFinancialAccountUseCase.uniqueName],
    fetch: useCases.createFinancialAccountUseCase.execute,
  });
  const updateMutation = useMutation({
    cacheKey: [useCases.updateFinancialAccountUseCase.uniqueName],
    fetch: saveAccountChanges,
  });
  const deleteMutation = useMutation({
    cacheKey: [useCases.deleteFinancialAccountUseCase.uniqueName],
    fetch: useCases.deleteFinancialAccountUseCase.execute,
  });

  useEffect(() => {
    if (
      createMutation.status === "success" ||
      updateMutation.status === "success" ||
      deleteMutation.status === "success"
    ) {
      // Narrow key (prefix also covers the list); the form must not reopen on old data.
      invalidateFetcherData([useCases.getFinancialAccountsUseCase.uniqueName]);
      router.back();
    }
  }, [createMutation.status, updateMutation.status, deleteMutation.status]);

  // Owner is immutable on the API (edit) and fixed when opened from the transaction form (create).
  const isOwnerLocked = isEditing || !!params.ownerId;

  const validationInitial = isEditing ? initial : undefined;
  const errors = submitted && state ? validate(state, validationInitial) : {};
  const formErrorKey = getFinancialErrorMessageKey(
    createMutation.error ?? updateMutation.error ?? deleteMutation.error,
  );

  function update(next: AccountFormState) {
    setEdited(next);
  }

  function onSave() {
    setSubmitted(true);
    if (
      !state ||
      !initial ||
      !uiModel ||
      Object.keys(validate(state, validationInitial)).length
    ) {
      return;
    }

    if (isEditing) {
      const changes = toUpdateParams(params.id!, state, initial);

      // Only the id means nothing changed: close without a request.
      if (Object.keys(changes).length === 1) {
        router.back();
        return;
      }
      updateMutation.mutate(changes);
      return;
    }

    createMutation.mutate(toCreateParams(state, uiModel.owner(state.ownerId)));
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

  return {
    amountCents: state?.amountCents ?? 0,
    amountError: errors.amount,
    archiveWarningCount:
      state?.isArchived && !initial?.isArchived
        ? (series.data?.length ?? 0)
        : 0,
    balanceHelperKey: (isEditing
      ? "financial.accounts.form.balanceHelper"
      : "financial.accounts.form.initialBalanceHelper") as TranslationKeys,
    balanceLabelKey: (isEditing
      ? "financial.accounts.form.balance"
      : "financial.accounts.form.initialBalance") as TranslationKeys,
    deleteTitleParams: { name: state?.name ?? "" },
    formErrorKey,
    icon: state?.icon ?? "",
    iconOptions: uiModel?.iconOptions ?? [],
    isArchived: state?.isArchived ?? false,
    isDeleteDialogOpen,
    isDeleting: deleteMutation.isFetching,
    isDiscardDialogOpen,
    isEditing,
    isLoading: !state && !isNotFound,
    isNotFound,
    isOwnerLocked,
    isSaving: createMutation.isFetching || updateMutation.isFetching,
    name: state?.name ?? "",
    nameError: errors.name,
    onAmountChange: (cents: number) => {
      if (state) {
        update({ ...state, amountCents: cents });
      }
    },
    onArchivedChange: (value: boolean) => {
      if (state) {
        update({ ...state, isArchived: value });
      }
    },
    onClose,
    onDeleteCancel: () => setDeleteDialogOpen(false),
    onDeleteConfirm,
    onDeletePress: () => setDeleteDialogOpen(true),
    onDiscardCancel: () => setDiscardDialogOpen(false),
    onDiscardConfirm: () => router.back(),
    onIconChange: (value: string) => {
      if (state) {
        update({ ...state, icon: value });
      }
    },
    onNameChange: (value: string) => {
      if (state) {
        update({ ...state, name: value });
      }
    },
    onOwnerChange: (value: string) => {
      if (state && !isOwnerLocked) {
        update({ ...state, ownerId: value });
      }
    },
    onSave,
    onSignChange: (value: string) => {
      if (state) {
        update({ ...state, isNegative: value === "NEGATIVE" });
      }
    },
    ownerChoices: uiModel?.ownerChoices ?? [],
    ownerHelperKey: (isEditing ? "financial.common.ownerLocked" : undefined) as
      | TranslationKeys
      | undefined,
    ownerId: state?.ownerId ?? "",
    saveLabelKey: (isEditing
      ? "financial.common.saveChanges"
      : "financial.accounts.form.save") as TranslationKeys,
    sign: (state?.isNegative ? "NEGATIVE" : "POSITIVE") as
      | "NEGATIVE"
      | "POSITIVE",
    signOptions: uiModel?.signOptions ?? [],
    titleKey: (isEditing
      ? "financial.accounts.edit"
      : "financial.accounts.new") as TranslationKeys,
  };
}

export { saveAccountChanges };
export default useNewAccountViewModel;
