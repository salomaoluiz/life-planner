import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { CategoryHasPendingItems } from "@domain/entities/errors";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import { isHexColor } from "@presentation/constants/categoryColors";
import { useLocaleTag } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";
import {
  pickRootColor,
  rootColorOf,
  toneSequence,
} from "@screens/Financial/models/categoryColorPicker";
import {
  ALL_OWNERS,
  personalOwnerId,
} from "@screens/Financial/models/ownerOptions";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import { buildApplyModel } from "../models/applyToSubcategories";
import {
  autoColor,
  CategoryFormState,
  changeOwner,
  changeType,
  createInitialState,
  isSameState,
  rootColorsOf,
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

// "05/11" / "11/05" style day and month of a `YYYY-MM-DD` calendar date, in the language of the app.
function formatShortDate(calendarDate: string, localeTag: string) {
  const [year, month, day] = calendarDate.split("-").map(Number);

  return new Intl.DateTimeFormat(localeTag, {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(year, month - 1, day));
}

function useNewCategoryViewModel() {
  const { closeModal } = useModalNavigation();
  const params = useLocalSearchParams<{
    id?: string;
    ownerId?: string;
    type?: string;
  }>();
  const isEditing = !!params.id;
  // The draw of the root color is made once per opening, so a refetch of the lists does not change it.
  const draw = useRef(Math.random());

  const owners = useActiveOwners();
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

    const ownerId =
      params.ownerId ?? personalOwnerId(owners.data) ?? owners.data[0].id;

    return createInitialState({
      ownerId,
      rootColor: pickRootColor(
        rootColorsOf(categories.data, ownerId),
        () => draw.current,
      ),
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
  const [isArchiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [isPendingDismissed, setPendingDismissed] = useState(false);
  const localeTag = useLocaleTag();
  const [isCustomColorOpen, setCustomColorOpen] = useState(false);
  const [customColorDraft, setCustomColorDraft] = useState("");
  const [isIconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconQuery, setIconQuery] = useState("");
  // Spec 058: opt-in switches, both off until the owner turns them on.
  const [applyColor, setApplyColor] = useState(false);
  const [applyIcon, setApplyIcon] = useState(false);

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
  const appearanceMutation = useMutation({
    cacheKey: [useCases.updateFinancialCategoryAppearanceUseCase.uniqueName],
    fetch: useCases.updateFinancialCategoryAppearanceUseCase.execute,
  });
  const deleteMutation = useMutation({
    cacheKey: [useCases.deleteFinancialCategoryUseCase.uniqueName],
    fetch: useCases.deleteFinancialCategoryUseCase.execute,
  });

  useEffect(() => {
    if (
      createMutation.status === "success" ||
      updateMutation.status === "success" ||
      appearanceMutation.status === "success" ||
      deleteMutation.status === "success"
    ) {
      // The list (and a reopened form) must not show the old status.
      invalidateFetcherData([
        useCases.getFinancialCategoriesUseCase.uniqueName,
      ]);
      closeModal();
    }
  }, [
    createMutation.status,
    updateMutation.status,
    appearanceMutation.status,
    deleteMutation.status,
  ]);

  const id = params.id ?? "";
  const hasChildren = isEditing && !!uiModel?.hasChildren(id);
  const hasParent = isEditing && !!uiModel?.hasParent(id);
  const hasTransactions = isEditing && !!uiModel?.hasTransactions(id);
  const isTypeLocked =
    isEditing && (hasParent || hasChildren || hasTransactions);
  const isAll = state?.ownerId === ALL_OWNERS;
  const wasAll = initial?.ownerId === ALL_OWNERS;
  // Owner is immutable on the API (edit) and fixed when opened from the transaction form (create). The one change
  // allowed is turning a single-scope main category into an All one (spec 038); an All category stays All.
  const isOwnerLocked = isEditing ? wasAll || hasParent : !!params.ownerId;

  let ownerHelperKey: TranslationKeys | undefined;
  if (isAll) {
    ownerHelperKey =
      isEditing && wasAll
        ? "financial.categories.form.ownerLockedAll"
        : "financial.categories.form.ownerAllHint";
  } else if (isEditing) {
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
    createMutation.error ??
      updateMutation.error ??
      appearanceMutation.error ??
      deleteMutation.error,
  );

  function ownerChoices() {
    if (!uiModel) {
      return [];
    }

    return isEditing && initial
      ? uiModel.ownerChoicesFor(initial.ownerId)
      : uiModel.ownerChoices;
  }

  function update(next: CategoryFormState) {
    setEdited(next);
    // A reverted field drops its switch (spec 058 FR 2).
    if (
      initial &&
      next.iconColor.toLowerCase() === initial.iconColor.toLowerCase()
    ) {
      setApplyColor(false);
    }
    if (initial && next.icon === initial.icon) {
      setApplyIcon(false);
    }
  }

  // Spec 054 FR 14: creating only; an edit never recolors the category.
  function withAutoColor(next: CategoryFormState) {
    return isEditing
      ? next
      : autoColor(next, categories.data ?? [], (used) =>
          pickRootColor(used, () => draw.current),
        );
  }

  // Spec 058: the "apply to subcategories" block exists only when editing a category that has descendants.
  const apply =
    isEditing && state && initial && categories.data
      ? buildApplyModel({
          applyColor,
          applyIcon,
          categories: categories.data,
          categoryId: id,
          categoryName:
            state.name.trim().length > 0
              ? state.name.trim()
              : (existing?.name ?? ""),
          initial: { icon: initial.icon, iconColor: initial.iconColor },
          next: { icon: state.icon, iconColor: state.iconColor },
        })
      : undefined;
  const isApplying = !!apply && (apply.effectiveColor || apply.effectiveIcon);

  function onSave() {
    setSubmitted(true);
    if (!state || !initial || !uiModel || Object.keys(validate(state)).length) {
      return;
    }

    if (isEditing) {
      const changes = toUpdateParams(params.id!, state, initial);

      // Spec 058: the category and its descendants go in one request, all or nothing.
      if (apply && apply.descendants.length > 0) {
        appearanceMutation.mutate({
          ...changes,
          descendants: apply.descendants,
        });
        return;
      }

      // Only the id means nothing changed: close without a request.
      if (Object.keys(changes).length === 1) {
        closeModal();
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
    closeModal();
  }

  function onDeleteConfirm() {
    setDeleteDialogOpen(false);
    deleteMutation.mutate({
      id: params.id!,
      ownerId: existing?.ownerId ?? state!.ownerId,
    });
  }

  // Spec 041: archive / reactivate patch only the status (with the subtree), independent of the form fields.
  function onArchiveConfirm() {
    setArchiveDialogOpen(false);
    setPendingDismissed(false);
    updateMutation.mutate({ id: params.id!, status: "ARCHIVED" });
  }

  function onReactivatePress() {
    updateMutation.mutate({ id: params.id!, status: "ACTIVE" });
  }

  function onCustomColorOpen() {
    setCustomColorDraft(state?.iconColor ?? "");
    setCustomColorOpen(true);
  }

  function onCustomColorApply() {
    if (!state || !isHexColor(customColorDraft)) {
      return;
    }
    update({
      ...state,
      colorTouched: true,
      iconColor: customColorDraft.toUpperCase(),
    });
    setCustomColorOpen(false);
  }

  const isExistingAll = existing?.scope === "ALL";
  let deleteMessageKeys: TranslationKeys[] = [
    "financial.categories.deleteAlertMsg",
  ];
  if (isExistingAll) {
    deleteMessageKeys = ["financial.categories.deleteConfirm.allScopes"];
  } else if (hasChildren) {
    deleteMessageKeys = [
      "financial.categories.deleteAlertMsg",
      "financial.categories.deleteConfirm.withSubcategories",
    ];
  }

  const isArchived = existing?.status === "ARCHIVED";
  const pendingError =
    updateMutation.error instanceof CategoryHasPendingItems &&
    !isPendingDismissed
      ? updateMutation.error
      : undefined;
  const pendingItems = pendingError && {
    hiddenCount: pendingError.hiddenCount,
    plans: pendingError.installmentPlans.map((plan) => ({
      count: plan.remainingInstallments,
      description: plan.description,
      id: plan.id,
    })),
    recurrences: pendingError.recurrences.map((recurrence) => ({
      date: recurrence.nextOccurrenceDate
        ? formatShortDate(recurrence.nextOccurrenceDate, localeTag)
        : "",
      description: recurrence.description,
      id: recurrence.id,
    })),
  };

  const parentCategory = categories.data?.find(
    (item) => item.id === state?.parentId,
  );
  const rootColor =
    state?.parentId && categories.data
      ? rootColorOf(state.parentId, categories.data)
      : undefined;
  const toneOptions =
    parentCategory && rootColor
      ? toneSequence(rootColor).map((value, index) => ({
          label: String(index + 1),
          value,
        }))
      : [];

  let saveLabelKey: TranslationKeys = "financial.categories.form.save";
  if (isApplying) {
    saveLabelKey = "financial.categories.form.saveAndApply";
  } else if (isEditing) {
    saveLabelKey = "financial.common.saveChanges";
  }

  return {
    applyColorOn: applyColor,
    applyCount: apply?.count ?? 0,
    applyIconOn: applyIcon,
    applyName: apply?.preview[0]?.name ?? "",
    applyPreview: apply?.preview ?? [],
    archiveBodyKeys: (hasChildren
      ? [
          "financial.categories.archive.confirmBody",
          "financial.categories.archive.confirmBodyWithChildren",
        ]
      : ["financial.categories.archive.confirmBody"]) as TranslationKeys[],
    colorOptions: uiModel?.colorOptions ?? [],
    colorSwitchVisible: apply?.colorSwitchVisible ?? false,
    customColorDraft,
    customColorError,
    deleteConfirmLabelKey: (isExistingAll
      ? "financial.categories.deleteAllConfirm"
      : "common.actions.delete") as TranslationKeys,
    deleteMessageKeys,
    deleteTitleParams: { name: state?.name ?? "" },
    formErrorKey,
    hasChildren,
    icon: state?.icon ?? "",
    iconColor: state?.iconColor ?? "",
    iconQuery,
    iconSwitchVisible: apply?.iconSwitchVisible ?? false,
    inlineIcons: uiModel?.iconOptions("", false) ?? [],
    isApplyVisible: apply?.visible ?? false,
    isArchived,
    isArchiveDialogOpen,
    isCustomColorOpen,
    isDeleteDialogOpen,
    isDeleting: deleteMutation.isFetching,
    isDiscardDialogOpen,
    isEditing,
    isIconPickerOpen,
    isLoading: !state && !isNotFound,
    isNotFound,
    isOwnerLocked,
    isSaving:
      createMutation.isFetching ||
      updateMutation.isFetching ||
      appearanceMutation.isFetching,
    isTypeLocked,
    isUpdating: updateMutation.isFetching,
    name: state?.name ?? "",
    nameError: errors.name,
    onApplyColorToggle: () => setApplyColor((value) => !value),
    onApplyIconToggle: () => setApplyIcon((value) => !value),
    onArchiveCancel: () => setArchiveDialogOpen(false),
    onArchiveConfirm,
    onArchivePress: () => setArchiveDialogOpen(true),
    onClose,
    onColorChange: (value: string) => {
      if (state) {
        update({ ...state, colorTouched: true, iconColor: value });
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
    onDiscardConfirm: () => closeModal(),
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
        update(withAutoColor(changeOwner(state, value)));
      }
    },
    onParentChange: (value: string) => {
      if (state) {
        update(withAutoColor({ ...state, parentId: value || undefined }));
      }
    },
    onPendingClose: () => setPendingDismissed(true),
    onReactivatePress,
    onSave,
    onTypeChange: (value: string) => {
      if (state) {
        update(withAutoColor(changeType(state, value, categories.data ?? [])));
      }
    },
    ownerChoices: ownerChoices(),
    ownerHelperKey,
    ownerId: state?.ownerId ?? "",
    parentHelperKey: (isAll
      ? "financial.categories.form.parentAllHint"
      : undefined) as TranslationKeys | undefined,
    parentId: state?.parentId ?? "",
    parentName: parentCategory?.name ?? "",
    parentOptions:
      uiModel && state ? uiModel.parentOptions(state, params.id) : [],
    pendingItems,
    pickerIcons: uiModel?.iconOptions(iconQuery, true) ?? [],
    saveLabelKey,
    saveLabelParams: { count: apply?.count ?? 0 },
    titleKey: (isEditing
      ? "financial.categories.edit"
      : "financial.categories.new") as TranslationKeys,
    toneOptions,
    type: state?.type ?? "EXPENSE",
    typeHelperKey: (isTypeLocked
      ? "financial.categories.form.typeLocked"
      : undefined) as TranslationKeys | undefined,
    typeOptions: uiModel?.typeOptions ?? [],
  };
}

export default useNewCategoryViewModel;
