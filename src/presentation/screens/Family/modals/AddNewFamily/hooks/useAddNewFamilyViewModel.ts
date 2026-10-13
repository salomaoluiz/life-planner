import { router } from "expo-router";
import { useEffect, useState } from "react";

import { useCases } from "@application/useCases";
import { CreateFamilyUseCaseParams } from "@application/useCases/cases/family/createFamilyUseCase";
import { invalidateFetcherData, useMutation } from "@infrastructure/fetcher";
import { TranslationKeys } from "@presentation/i18n/types";

export const COUNTER_FROM = 40;
export const FAMILY_NAME_MAX = 50;

function useAddNewFamilyViewModel() {
  const [name, setName] = useState("");
  const [showValidation, setShowValidation] = useState(false);

  const createFamily = useMutation<CreateFamilyUseCaseParams, void>({
    cacheKey: [useCases.createFamilyUseCase.uniqueName],
    fetch: useCases.createFamilyUseCase.execute,
  });

  useEffect(() => {
    if (createFamily.status === "success") {
      // Close first, then refetch: the Family list shows the new card expanded.
      router.back();
      invalidateFetcherData();
    }
  }, [createFamily.status]);

  const trimmed = name.trim();
  const validationKey: TranslationKeys | undefined =
    trimmed.length === 0 ? "family.form.nameRequired" : undefined;

  function onSubmit() {
    setShowValidation(true);

    if (validationKey || createFamily.isFetching) {
      return;
    }

    createFamily.mutate({ name: trimmed });
  }

  return {
    counterVisible: name.length >= COUNTER_FROM,
    errorKey: showValidation ? validationKey : undefined,
    hasGenericError: !!createFamily.error,
    isSubmitting: createFamily.isFetching,
    name,
    onChangeName: (value: string) => setName(value.slice(0, FAMILY_NAME_MAX)),
    onClose: () => router.back(),
    onSubmit,
  };
}

export default useAddNewFamilyViewModel;
