import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";

import { useCases } from "@application/useCases";
import { GenericError } from "@domain/entities/errors";
import {
  ShoppingListCardEntity,
  ShoppingListStatuses,
} from "@domain/entities/stock/ShoppingListEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { invalidateFetcherData, useQuery } from "@infrastructure/fetcher";
import { useTranslationLocale } from "@presentation/i18n";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

const NAME_MAX = 50;
const INTERVAL_MIN = 1;
const INTERVAL_MAX = 90;

export type ShoppingListVM = ReturnType<typeof useShoppingListViewModel>;

// Spec 123 FR 9: whole days from 1 to 90.
function parseInterval(text: string): number | undefined {
  const value = Number(text);

  return /^\d{1,3}$/.test(text.trim()) &&
    value >= INTERVAL_MIN &&
    value <= INTERVAL_MAX
    ? value
    : undefined;
}

function statusOf(error: unknown) {
  return error instanceof GenericError
    ? (error.context.error as undefined | { statusCode?: number })?.statusCode
    : undefined;
}

export default useShoppingListViewModel;

// Spec 118 section 8: "Nova lista" and "Editar lista" (owner only at creation; the default switch; archive).
function useShoppingListViewModel() {
  const { closeModal } = useModalNavigation();
  const { getLocale } = useTranslationLocale();
  const params = useLocalSearchParams<{ id?: string; ownerId?: string }>();
  const owners = useActiveOwners();
  const lists = useQuery<ShoppingListCardEntity[]>({
    cacheKey: [useCases.getShoppingListsUseCase.uniqueName, "form"],
    fetch: async () =>
      useCases.getShoppingListsUseCase.execute({ includeArchived: true }),
  });

  const editing = lists.data?.find((card) => card.id === params.id);
  const isEdit = !!params.id;
  const [name, setName] = useState<string | undefined>();
  const [ownerId, setOwnerId] = useState<string | undefined>();
  const [isDefault, setIsDefault] = useState<boolean | undefined>();
  const [intervalText, setIntervalText] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorKey, setErrorKey] = useState<
    "common.errors.generic" | "stock.lists.nameTaken" | undefined
  >();

  const ownerOptions = owners.data ?? [];
  const selectedOwnerId =
    ownerId ??
    editing?.ownerId ??
    params.ownerId ??
    ownerOptions.find((owner) => owner.type === OwnerType.USER)?.id;
  const selectedOwner = ownerOptions.find(
    (owner) => owner.id === selectedOwnerId,
  );
  const currentName = name ?? editing?.name ?? "";
  const currentDefault = isDefault ?? editing?.isDefault ?? false;
  const currentIntervalText =
    intervalText ?? String(editing?.purchaseIntervalDays ?? 7);
  const interval = parseInterval(currentIntervalText);
  const intervalError =
    isEdit && interval === undefined
      ? ("stock.lists.intervalInvalid" as const)
      : undefined;
  const ownerDefault = useMemo(
    () =>
      lists.data?.find(
        (card) =>
          card.ownerId === selectedOwnerId &&
          card.isDefault &&
          card.status === ShoppingListStatuses.ACTIVE,
      ),
    [lists.data, selectedOwnerId],
  );
  const nameError =
    submitted &&
    (currentName.trim() === "" || currentName.trim().length > NAME_MAX)
      ? ("stock.lists.nameRequired" as const)
      : undefined;

  async function finish() {
    await invalidateFetcherData([useCases.getShoppingListsUseCase.uniqueName]);
    closeModal();
  }

  async function submit() {
    setSubmitted(true);
    setErrorKey(undefined);

    const trimmed = currentName.trim();

    if (
      trimmed === "" ||
      trimmed.length > NAME_MAX ||
      !selectedOwner ||
      (isEdit && interval === undefined)
    ) {
      return;
    }

    setSaving(true);

    try {
      if (editing) {
        await useCases.updateShoppingListUseCase.execute({
          id: editing.id,
          isDefault:
            currentDefault !== editing.isDefault ? currentDefault : undefined,
          name: trimmed !== editing.name ? trimmed : undefined,
          purchaseIntervalDays:
            interval !== editing.purchaseIntervalDays ? interval : undefined,
        });
      } else {
        await useCases.createShoppingListUseCase.execute({
          isDefault: currentDefault,
          name: trimmed,
          owner: selectedOwner.type === OwnerType.FAMILY ? "FAMILY" : "USER",
          ownerId: selectedOwner.id,
        });
      }

      await finish();
    } catch (error) {
      setErrorKey(
        statusOf(error) === 409
          ? "stock.lists.nameTaken"
          : "common.errors.generic",
      );
    } finally {
      setSaving(false);
    }
  }

  async function onArchive() {
    // The default list never archives (the API refuses it too): choose another default first.
    if (!editing || editing.isDefault) {
      return;
    }

    setSaving(true);
    setErrorKey(undefined);

    try {
      await useCases.updateShoppingListUseCase.execute({
        id: editing.id,
        status: "ARCHIVED",
      });
      await invalidateFetcherData([
        useCases.getShoppingListsUseCase.uniqueName,
      ]);
      closeModal();
      router.replace("/stock/lists" as never);
    } catch {
      setErrorKey("common.errors.generic");
    } finally {
      setSaving(false);
    }
  }

  return {
    canArchive: isEdit && !!editing && !editing.isDefault,
    currentIntervalText,
    currentName,
    defaultListName: ownerDefault?.name,
    errorKey,
    interval,
    intervalError,
    isDefault: currentDefault,
    isEdit,
    isLoading: lists.isFetching && !lists.data,
    languageTag: getLocale().languageTag,
    nameError,
    nextTripDate: editing?.nextTripDate,
    onArchive,
    onClose: closeModal,
    onDefaultChange: setIsDefault,
    onIntervalChange: setIntervalText,
    onNameChange: setName,
    onOwnerChange: setOwnerId,
    onSubmit: submit,
    onUseSuggested: () => {
      if (editing?.suggestedIntervalDays !== undefined) {
        setIntervalText(String(editing.suggestedIntervalDays));
      }
    },
    ownerName:
      selectedOwner?.type === OwnerType.FAMILY ? selectedOwner.name : undefined,
    ownerOptions,
    saving,
    selectedOwnerId,
    // Spec 123 FR 11: only when it exists and differs from the value being edited.
    suggestedInterval:
      editing?.suggestedIntervalDays !== undefined &&
      editing.suggestedIntervalDays !== interval
        ? editing.suggestedIntervalDays
        : undefined,
    wasDefault: editing?.isDefault ?? false,
  };
}
