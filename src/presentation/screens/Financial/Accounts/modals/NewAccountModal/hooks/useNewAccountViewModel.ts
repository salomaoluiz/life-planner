import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import { TranslationKeys } from "@presentation/i18n/types";
import { personalOwnerId } from "@screens/Financial/models/ownerOptions";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";

import {
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

function useNewAccountViewModel() {
  const params = useLocalSearchParams<{ id?: string; ownerId?: string }>();
  const isEditing = !!params.id;

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
    fetch: useCases.updateFinancialAccountUseCase.execute,
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
      router.back();
    }
  }, [createMutation.status, updateMutation.status, deleteMutation.status]);

  // Owner is immutable on the API (edit) and fixed when opened from the transaction form (create).
  const isOwnerLocked = isEditing || !!params.ownerId;

  const errors = submitted && state ? validate(state) : {};
  const formErrorKey = getFinancialErrorMessageKey(
    createMutation.error ?? updateMutation.error ?? deleteMutation.error,
  );

  function update(next: AccountFormState) {
    setEdited(next);
  }

  function onSave() {
    setSubmitted(true);
    if (!state || !initial || !uiModel || Object.keys(validate(state)).length) {
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
    balanceHelperKey:
      "financial.accounts.form.balanceHelper" as TranslationKeys,
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

export default useNewAccountViewModel;
