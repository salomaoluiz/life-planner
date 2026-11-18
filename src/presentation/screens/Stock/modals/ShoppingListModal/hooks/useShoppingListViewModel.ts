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
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

const NAME_MAX = 50;

export type ShoppingListVM = ReturnType<typeof useShoppingListViewModel>;

function statusOf(error: unknown) {
  return error instanceof GenericError
    ? (error.context.error as undefined | { statusCode?: number })?.statusCode
    : undefined;
}

export default useShoppingListViewModel;

// Spec 118 section 8: "Nova lista" and "Editar lista" (owner only at creation; the default switch; archive).
function useShoppingListViewModel() {
  const { closeModal } = useModalNavigation();
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

    if (trimmed === "" || trimmed.length > NAME_MAX || !selectedOwner) {
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
    currentName,
    defaultListName: ownerDefault?.name,
    errorKey,
    isDefault: currentDefault,
    isEdit,
    isLoading: lists.isFetching && !lists.data,
    nameError,
    onArchive,
    onClose: closeModal,
    onDefaultChange: setIsDefault,
    onNameChange: setName,
    onOwnerChange: setOwnerId,
    onSubmit: submit,
    ownerName:
      selectedOwner?.type === OwnerType.FAMILY ? selectedOwner.name : undefined,
    ownerOptions,
    saving,
    selectedOwnerId,
    wasDefault: editing?.isDefault ?? false,
  };
}
