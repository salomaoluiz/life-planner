import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { useCases } from "@application/useCases";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import { TranslationKeys } from "@presentation/i18n/types";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";
import {
  ALL_OWNERS,
  buildOwnerChoices,
  personalOwnerId,
} from "@screens/Financial/models/ownerOptions";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";

import {
  createInitialState,
  isSameState,
  stateFromDto,
  TagFormState,
  toCreateParams,
  toUpdateParams,
  validate,
} from "../models/tagFormState";

function useNewTagViewModel() {
  const params = useLocalSearchParams<{ id?: string; ownerId?: string }>();
  const isEditing = !!params.id;

  const owners = useActiveOwners();
  const tags = useQuery({
    cacheKey: [useCases.getFinancialTagsUseCase.uniqueName],
    enabled: !!owners.data,
    fetch: async () =>
      useCases.getFinancialTagsUseCase.execute(
        owners.data!.map((owner) => owner.id),
      ),
  });

  const existing = tags.data?.find((item) => item.id === params.id);
  const isNotFound = isEditing && !!tags.data && !existing;

  const initial = useMemo(() => {
    if (!owners.data || !tags.data) {
      return undefined;
    }
    if (isEditing) {
      return existing ? stateFromDto(existing) : undefined;
    }

    return createInitialState(
      params.ownerId ?? personalOwnerId(owners.data) ?? owners.data[0].id,
    );
  }, [owners.data, tags.data, isEditing, existing, params.ownerId]);

  const [edited, setEdited] = useState<TagFormState>();
  const [submitted, setSubmitted] = useState(false);
  const [isDiscardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const state = edited ?? initial;
  const isDirty = !!edited && !!initial && !isSameState(edited, initial);

  const createMutation = useMutation({
    cacheKey: [useCases.createFinancialTagUseCase.uniqueName],
    fetch: useCases.createFinancialTagUseCase.execute,
  });
  const updateMutation = useMutation({
    cacheKey: [useCases.updateFinancialTagUseCase.uniqueName],
    fetch: useCases.updateFinancialTagUseCase.execute,
  });
  const deleteMutation = useMutation({
    cacheKey: [useCases.deleteFinancialTagUseCase.uniqueName],
    fetch: useCases.deleteFinancialTagUseCase.execute,
  });

  useEffect(() => {
    if (
      createMutation.status === "success" ||
      updateMutation.status === "success" ||
      deleteMutation.status === "success"
    ) {
      // The list, the suggestions of the transaction form and the cached transactions must not show the old tags.
      invalidateFetcherData([
        useCases.getFinancialTagsUseCase.uniqueName,
        useCases.getFinancialTransactionsUseCase.uniqueName,
      ]);
      router.back();
    }
  }, [createMutation.status, updateMutation.status, deleteMutation.status]);

  const wasAll = initial?.ownerId === ALL_OWNERS;
  // Owner is immutable on the API (edit) and fixed when opened from the transaction form (create); the one change
  // allowed is turning a single-scope tag into an All one (no way back).
  const isOwnerLocked = isEditing ? wasAll : !!params.ownerId;
  const errors = submitted && state ? validate(state) : {};
  const formErrorKey = getFinancialErrorMessageKey(
    createMutation.error ?? updateMutation.error ?? deleteMutation.error,
  );
  // A name already in use is a field error, not a form one.
  const nameInUse = formErrorKey === "financial.tagForm.nameInUse";

  const ownerChoices = useMemo(() => {
    const choices = [
      ...buildOwnerChoices(owners.data ?? []),
      { labelKey: "financial.tags.all" as const, value: ALL_OWNERS },
    ];

    return isEditing && initial
      ? choices.filter(
          (choice) =>
            choice.value === ALL_OWNERS || choice.value === initial.ownerId,
        )
      : choices;
  }, [owners.data, isEditing, initial]);

  function onSave() {
    setSubmitted(true);
    if (!state || !initial || Object.keys(validate(state)).length) {
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

    createMutation.mutate(
      toCreateParams(
        state,
        owners.data?.find((owner) => owner.id === state.ownerId),
      ),
    );
  }

  function onClose() {
    if (isDirty) {
      setDiscardDialogOpen(true);
      return;
    }
    router.back();
  }

  const usage = existing?.usageCount ?? 0;
  let deleteMessageKey: TranslationKeys = "financial.tagDelete.unused";
  if (usage > 0) {
    deleteMessageKey =
      existing?.scope === "ALL"
        ? "financial.tagDelete.allInUse"
        : "financial.tagDelete.inUse";
  }

  return {
    deleteConfirmLabelKey: (existing?.scope === "ALL"
      ? "financial.tagDelete.confirmAll"
      : "financial.tagDelete.confirm") as TranslationKeys,
    deleteMessageKey,
    deleteTitleParams: { name: existing?.name ?? state?.name ?? "" },
    formErrorKey: nameInUse ? undefined : formErrorKey,
    isDeleteDialogOpen,
    isDeleting: deleteMutation.isFetching,
    isDiscardDialogOpen,
    isEditing,
    isLoading: !state && !isNotFound,
    isNotFound,
    isOwnerLocked,
    isSaving: createMutation.isFetching || updateMutation.isFetching,
    name: state?.name ?? "",
    nameError: errors.name ?? (nameInUse ? formErrorKey : undefined),
    onClose,
    onDeleteCancel: () => setDeleteDialogOpen(false),
    onDeleteConfirm: () => {
      setDeleteDialogOpen(false);
      deleteMutation.mutate({ id: params.id! });
    },
    onDeletePress: () => setDeleteDialogOpen(true),
    onDiscardCancel: () => setDiscardDialogOpen(false),
    onDiscardConfirm: () => router.back(),
    onNameChange: (value: string) => {
      if (state) {
        setEdited({ ...state, name: value });
      }
    },
    onOwnerChange: (value: string) => {
      if (state) {
        setEdited({ ...state, ownerId: value });
      }
    },
    onSave,
    ownerChoices,
    ownerHelperKey: (state?.ownerId === ALL_OWNERS
      ? "financial.tagForm.allHelper"
      : undefined) as TranslationKeys | undefined,
    ownerId: state?.ownerId ?? "",
    usage,
  };
}

export default useNewTagViewModel;
