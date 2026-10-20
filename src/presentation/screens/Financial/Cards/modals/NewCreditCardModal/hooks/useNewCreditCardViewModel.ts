import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import AccountDTO from "@application/dto/financial/AccountDTO";
import { useCases } from "@application/useCases";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import { TranslationKeys } from "@presentation/i18n/types";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";
import { personalOwnerId } from "@screens/Financial/models/ownerOptions";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";

import {
  CardFormState,
  createInitialState,
  isPaymentAfterDue,
  isSameState,
  paymentAccountOptions,
  stateFromDto,
  toCreateParams,
  toUpdateParams,
  validate,
} from "../models/cardFormState";
import NewCreditCardUIModel from "../models/NewCreditCardUIModel";

function useNewCreditCardViewModel() {
  const params = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!params.id;

  const owners = useActiveOwners();
  const cards = useQuery({
    cacheKey: [useCases.getFinancialCreditCardsUseCase.uniqueName],
    enabled: !!owners.data,
    fetch: async () =>
      useCases.getFinancialCreditCardsUseCase.execute(
        owners.data!.map((owner) => owner.id),
      ),
  });

  const accounts = useQuery<AccountDTO[]>({
    cacheKey: [useCases.getFinancialAccountsUseCase.uniqueName],
    enabled: !!owners.data,
    fetch: async () =>
      useCases.getFinancialAccountsUseCase.execute(
        owners.data!.map((owner) => owner.id),
      ),
  });

  const existing = cards.data?.find((item) => item.id === params.id);
  const isNotFound = isEditing && !!cards.data && !existing;

  const uiModel = useMemo(
    () => (owners.data ? new NewCreditCardUIModel(owners.data) : undefined),
    [owners.data],
  );

  const initial = useMemo(() => {
    if (!owners.data || !cards.data) {
      return undefined;
    }
    if (isEditing) {
      return existing ? stateFromDto(existing) : undefined;
    }

    return createInitialState({
      ownerId: personalOwnerId(owners.data) ?? owners.data[0].id,
    });
  }, [owners.data, cards.data, isEditing, existing]);

  // The recurring series that end when the card is archived (spec 034 FR 34).
  const series = useQuery({
    cacheKey: [
      useCases.getFinancialRecurrencesUseCase.uniqueName,
      "card",
      params.id ?? "",
    ],
    enabled: isEditing && !!existing && existing.status !== "ARCHIVED",
    fetch: async () =>
      useCases.getFinancialRecurrencesUseCase.execute({
        creditCardId: params.id,
        ownerIds: [existing!.ownerId],
        status: "ACTIVE",
      }),
  });

  const [edited, setEdited] = useState<CardFormState>();
  const [submitted, setSubmitted] = useState(false);
  const [isDiscardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const state = edited ?? initial;
  const isDirty = !!edited && !!initial && !isSameState(edited, initial);

  const createMutation = useMutation({
    cacheKey: [useCases.createFinancialCreditCardUseCase.uniqueName],
    fetch: useCases.createFinancialCreditCardUseCase.execute,
  });
  const updateMutation = useMutation({
    cacheKey: [useCases.updateFinancialCreditCardUseCase.uniqueName],
    fetch: useCases.updateFinancialCreditCardUseCase.execute,
  });
  const deleteMutation = useMutation({
    cacheKey: [useCases.deleteFinancialCreditCardUseCase.uniqueName],
    fetch: useCases.deleteFinancialCreditCardUseCase.execute,
  });

  useEffect(() => {
    if (
      createMutation.status === "success" ||
      updateMutation.status === "success" ||
      deleteMutation.status === "success"
    ) {
      // The list screen (overview) and this form's list query must not reopen on old data.
      invalidateFetcherData([
        useCases.getFinancialCreditCardsOverviewUseCase.uniqueName,
      ]);
      invalidateFetcherData([
        useCases.getFinancialCreditCardsUseCase.uniqueName,
      ]);
      router.back();
    }
  }, [createMutation.status, updateMutation.status, deleteMutation.status]);

  const errors = submitted && state ? validate(state) : {};
  const formErrorKey = getFinancialErrorMessageKey(
    createMutation.error ?? updateMutation.error ?? deleteMutation.error,
  );

  function update(next: CardFormState) {
    setEdited(next);
  }

  function change(patch: Partial<CardFormState>) {
    if (state) {
      update({ ...state, ...patch });
    }
  }

  function onSave() {
    setSubmitted(true);
    if (!state || !initial || !uiModel || Object.keys(validate(state)).length) {
      return;
    }

    if (isEditing) {
      const changes = toUpdateParams(
        params.id!,
        state,
        initial,
        uiModel.owner(state.ownerId),
      );

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

  function onArchiveToggle() {
    if (!initial) {
      return;
    }
    updateMutation.mutate({
      id: params.id!,
      status: initial.isArchived ? "ACTIVE" : "ARCHIVED",
    });
  }

  function onDeleteConfirm() {
    setDeleteDialogOpen(false);
    deleteMutation.mutate({ id: params.id! });
  }

  return {
    archiveLabelKey: (initial?.isArchived
      ? "financial.cardForm.reactivate"
      : "financial.cardForm.archive") as TranslationKeys,
    archiveWarningCount: initial?.isArchived ? 0 : (series.data?.length ?? 0),
    brand: state?.brand ?? "VISA",
    brandOptions: uiModel?.brandOptions ?? [],
    closingDay: state?.closingDay ?? "",
    closingDayError: errors.closingDay,
    colorOptions: uiModel?.colorOptions ?? [],
    dayOptions: uiModel?.dayOptions ?? [],
    deleteTitleParams: { title: state?.title ?? "" },
    dueDay: state?.dueDay ?? "",
    dueDayError: errors.dueDay,
    formErrorKey,
    isDeleteDialogOpen,
    isDeleting: deleteMutation.isFetching,
    isDiscardDialogOpen,
    isEditing,
    isLoading: !state && !isNotFound,
    isNotFound,
    isSaving: createMutation.isFetching || updateMutation.isFetching,
    lastDigits: state?.lastDigits ?? "",
    lastDigitsError: errors.lastDigits,
    limitCents: state?.limitCents ?? 0,
    limitError: errors.limit,
    onArchiveToggle,
    onBrandChange: (value: string) => change({ brand: value }),
    onClose,
    onClosingDayChange: (value: string) => change({ closingDay: value }),
    onDeleteCancel: () => setDeleteDialogOpen(false),
    onDeleteConfirm,
    onDeletePress: () => setDeleteDialogOpen(true),
    onDiscardCancel: () => setDiscardDialogOpen(false),
    onDiscardConfirm: () => router.back(),
    onDueDayChange: (value: string) => change({ dueDay: value }),
    onLastDigitsChange: (value: string) =>
      change({ lastDigits: value.replace(/\D/g, "").slice(0, 4) }),
    onLimitChange: (cents: number) => change({ limitCents: cents }),
    onOwnerChange: (value: string) => change({ ownerId: value }),
    onPaymentAccountChange: (value: string) =>
      change({ paymentAccountId: value }),
    onPaymentDayChange: (value: string) => change({ paymentDay: value }),
    onSave,
    onTintChange: (value: string) => change({ tint: value }),
    onTitleChange: (value: string) => change({ title: value }),
    ownerChoices: uiModel?.ownerChoices ?? [],
    ownerId: state?.ownerId ?? "",
    paymentAccountId: state?.paymentAccountId ?? "",
    paymentAccountOptions: paymentAccountOptions(
      accounts.data ?? [],
      state?.paymentAccountId ?? "",
    ),
    paymentDay: state?.paymentDay ?? "",
    paymentDayOptions: uiModel?.paymentDayOptions ?? [],
    paymentWarning: state ? isPaymentAfterDue(state) : false,
    saveLabelKey: (isEditing
      ? "financial.common.saveChanges"
      : "financial.cardForm.save") as TranslationKeys,
    tint: state?.tint ?? "",
    title: state?.title ?? "",
    titleError: errors.title,
    titleKey: (isEditing
      ? "financial.cardForm.titleEdit"
      : "financial.cardForm.titleNew") as TranslationKeys,
  };
}

export default useNewCreditCardViewModel;
