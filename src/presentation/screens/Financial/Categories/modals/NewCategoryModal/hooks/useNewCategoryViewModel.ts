import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import { isHexColor } from "@presentation/constants/categoryColors";
import { TranslationKeys } from "@presentation/i18n/types";
import { personalOwnerId } from "@screens/Financial/models/ownerOptions";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";

import {
  CategoryFormState,
  changeOwner,
  changeType,
  createInitialState,
  isSameState,
  stateFromDto,
  toCreateParams,
  toUpdateParams,
  validate,
} from "../models/categoryFormState";
import NewCategoryUIModel from "../models/NewCategoryUIModel";

async function fetchByOwners<T>(
  owners: OwnerDTO[],
  execute: (ownerIds: string[]) => Promise<T>,
) {
  return execute(owners.map((owner) => owner.id));
}

function useNewCategoryViewModel() {
  const params = useLocalSearchParams<{
    id?: string;
    ownerId?: string;
    type?: string;
  }>();
  const isEditing = !!params.id;

  const owners = useQuery({
    cacheKey: [useCases.getOwnersUseCase.uniqueName],
    fetch: useCases.getOwnersUseCase.execute,
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
  // Only edit mode needs the transactions (a category with transactions cannot change type).
  const transactions = useQuery({
    cacheKey: [useCases.getFinancialTransactionsUseCase.uniqueName],
    enabled: isEditing && !!owners.data,
    fetch: async () =>
      useCases.getFinancialTransactionsUseCase.execute({
        ownerIds: owners.data!.map((owner) => owner.id),
      }),
  });

  const existing = categories.data?.find((item) => item.id === params.id);
  const isNotFound = isEditing && !!categories.data && !existing;

  const uiModel = useMemo(
    () =>
      owners.data && categories.data
        ? new NewCategoryUIModel({
            categories: categories.data,
            owners: owners.data,
            transactions: transactions.data ?? [],
          })
        : undefined,
    [owners.data, categories.data, transactions.data],
  );

  const initial = useMemo(() => {
    if (!owners.data || !categories.data) {
      return undefined;
    }
    if (isEditing) {
      return existing && transactions.data ? stateFromDto(existing) : undefined;
    }

    return createInitialState({
      ownerId:
        params.ownerId ?? personalOwnerId(owners.data) ?? owners.data[0].id,
      type: params.type,
    });
  }, [
    owners.data,
    categories.data,
    transactions.data,
    isEditing,
    existing,
    params.ownerId,
    params.type,
  ]);

  const [edited, setEdited] = useState<CategoryFormState>();
  const [submitted, setSubmitted] = useState(false);
  const [isDiscardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isCustomColorOpen, setCustomColorOpen] = useState(false);
  const [customColorDraft, setCustomColorDraft] = useState("");
  const [isIconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconQuery, setIconQuery] = useState("");

  const state = edited ?? initial;
  const isDirty = !!edited && !!initial && !isSameState(edited, initial);

  const createMutation = useMutation({
    cacheKey: [useCases.createFinancialCategoryUseCase.uniqueName],
    fetch: useCases.createFinancialCategoryUseCase.execute,
  });
  const updateMutation = useMutation({
    cacheKey: [useCases.updateFinancialCategoryUseCase.uniqueName],
    fetch: useCases.updateFinancialCategoryUseCase.execute,
  });
  const deleteMutation = useMutation({
    cacheKey: [useCases.deleteFinancialCategoryUseCase.uniqueName],
    fetch: useCases.deleteFinancialCategoryUseCase.execute,
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

  const id = params.id ?? "";
  const hasChildren = isEditing && !!uiModel?.hasChildren(id);
  const hasParent = isEditing && !!uiModel?.hasParent(id);
  const hasTransactions = isEditing && !!uiModel?.hasTransactions(id);
  const isTypeLocked =
    isEditing && (hasParent || hasChildren || hasTransactions);
  // Owner is immutable on the API (edit) and fixed when opened from the transaction form (create).
  const isOwnerLocked = isEditing || !!params.ownerId;

  let ownerHelperKey: TranslationKeys | undefined;
  if (isEditing) {
    ownerHelperKey =
      hasParent || hasChildren
        ? "financial.categories.form.ownerLocked"
        : "financial.common.ownerLocked";
  }

  const errors = submitted && state ? validate(state) : {};
  const customColorError: TranslationKeys | undefined =
    customColorDraft && !isHexColor(customColorDraft)
      ? "financial.categories.form.customColorInvalid"
      : undefined;
  const formErrorKey = getFinancialErrorMessageKey(
    createMutation.error ?? updateMutation.error ?? deleteMutation.error,
  );

  function update(next: CategoryFormState) {
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

    createMutation.mutate(
      toCreateParams(
        state,
        uiModel.owner(state.ownerId),
        categories.data ?? [],
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

  function onDeleteConfirm() {
    setDeleteDialogOpen(false);
    deleteMutation.mutate({ id: params.id!, ownerId: state!.ownerId });
  }

  function onCustomColorOpen() {
    setCustomColorDraft(state?.iconColor ?? "");
    setCustomColorOpen(true);
  }

  function onCustomColorApply() {
    if (!state || !isHexColor(customColorDraft)) {
      return;
    }
    update({ ...state, iconColor: customColorDraft.toUpperCase() });
    setCustomColorOpen(false);
  }

  const deleteMessageKeys: TranslationKeys[] = hasChildren
    ? [
        "financial.categories.deleteAlertMsg",
        "financial.categories.deleteConfirm.withSubcategories",
      ]
    : ["financial.categories.deleteAlertMsg"];

  return {
    colorOptions: uiModel?.colorOptions ?? [],
    customColorDraft,
    customColorError,
    deleteMessageKeys,
    deleteTitleParams: { name: state?.name ?? "" },
    formErrorKey,
    hasChildren,
    icon: state?.icon ?? "",
    iconColor: state?.iconColor ?? "",
    iconQuery,
    inlineIcons: uiModel?.iconOptions("", false) ?? [],
    isCustomColorOpen,
    isDeleteDialogOpen,
    isDeleting: deleteMutation.isFetching,
    isDiscardDialogOpen,
    isEditing,
    isIconPickerOpen,
    isLoading: !state && !isNotFound,
    isNotFound,
    isOwnerLocked,
    isSaving: createMutation.isFetching || updateMutation.isFetching,
    isTypeLocked,
    name: state?.name ?? "",
    nameError: errors.name,
    onClose,
    onColorChange: (value: string) => {
      if (state) {
        update({ ...state, iconColor: value });
      }
    },
    onCustomColorApply,
    onCustomColorChange: setCustomColorDraft,
    onCustomColorClose: () => setCustomColorOpen(false),
    onCustomColorOpen,
    onDeleteCancel: () => setDeleteDialogOpen(false),
    onDeleteConfirm,
    onDeletePress: () => setDeleteDialogOpen(true),
    onDiscardCancel: () => setDiscardDialogOpen(false),
    onDiscardConfirm: () => router.back(),
    onIconChange: (value: string) => {
      if (state) {
        update({ ...state, icon: value });
      }
      setIconPickerOpen(false);
    },
    onIconPickerClose: () => setIconPickerOpen(false),
    onIconPickerOpen: () => {
      setIconQuery("");
      setIconPickerOpen(true);
    },
    onIconQueryChange: setIconQuery,
    onNameChange: (value: string) => {
      if (state) {
        update({ ...state, name: value });
      }
    },
    onOwnerChange: (value: string) => {
      if (state) {
        update(changeOwner(state, value));
      }
    },
    onParentChange: (value: string) => {
      if (state) {
        update({ ...state, parentId: value || undefined });
      }
    },
    onSave,
    onTypeChange: (value: string) => {
      if (state) {
        update(changeType(state, value, categories.data ?? []));
      }
    },
    ownerChoices: uiModel?.ownerChoices ?? [],
    ownerHelperKey,
    ownerId: state?.ownerId ?? "",
    parentId: state?.parentId ?? "",
    parentOptions:
      uiModel && state ? uiModel.parentOptions(state, params.id) : [],
    pickerIcons: uiModel?.iconOptions(iconQuery, true) ?? [],
    saveLabelKey: (isEditing
      ? "financial.common.saveChanges"
      : "financial.categories.form.save") as TranslationKeys,
    titleKey: (isEditing
      ? "financial.categories.edit"
      : "financial.categories.new") as TranslationKeys,
    type: state?.type ?? "EXPENSE",
    typeHelperKey: (isTypeLocked
      ? "financial.categories.form.typeLocked"
      : undefined) as TranslationKeys | undefined,
    typeOptions: uiModel?.typeOptions ?? [],
  };
}

export default useNewCategoryViewModel;
