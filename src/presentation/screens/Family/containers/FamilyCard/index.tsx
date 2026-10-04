import { router } from "expo-router";
import { useEffect } from "react";

import { useCases } from "@application/useCases";
import { DeleteFamilyUseCaseParams } from "@application/useCases/cases/family/deleteFamilyUseCase";
import { FamilyHasRecords } from "@domain/entities/errors";
import { useMutation } from "@infrastructure/fetcher";
import { useTranslation } from "@presentation/i18n";
import * as Components from "@screens/Family/components";
import FamilyViewModel from "@screens/Family/models/FamilyViewModel";
import {
  FeedbackActions,
  FeedbackNavigationTypes,
} from "@screens/Feedback/BusinessFeedback/actions/types";
import { FeedbackType } from "@screens/Feedback/BusinessFeedback/types";
import { createFeedbackRouteEncoded } from "@screens/Feedback/BusinessFeedback/utils";

interface Props {
  family: FamilyViewModel;
  refetchFamilies: () => void;
}

function FamilyCard(props: Props) {
  const { t } = useTranslation();
  const deleteFamily = useMutation<DeleteFamilyUseCaseParams, void>({
    cacheKey: [useCases.deleteFamilyUseCase.uniqueName],
    fetch: useCases.deleteFamilyUseCase.execute,
  });

  useEffect(() => {
    if (deleteFamily.status === "success") {
      props.refetchFamilies();
    }
  }, [deleteFamily.status]);

  async function showDeleteBlockedFeedback() {
    const dismiss = {
      action: FeedbackActions.NAVIGATION,
      route: "/family",
      type: FeedbackNavigationTypes.DISMISS_TO,
    } as const;

    const encodedRoute = await createFeedbackRouteEncoded({
      closeButton: dismiss,
      message: t("family.deleteBlocked.message"),
      primaryButton: { ...dismiss, label: t("family.deleteBlocked.close") },
      title: t("family.deleteBlocked.title"),
      type: FeedbackType.Error,
    });

    router.push({
      params: encodedRoute,
      pathname: "/business_feedback",
    });
  }

  useEffect(() => {
    if (deleteFamily.error instanceof FamilyHasRecords) {
      showDeleteBlockedFeedback();
    }
  }, [deleteFamily.error]);

  function onAddNewFamilyMember() {
    router.push({
      params: { familyId: props.family.familyId },
      pathname: "/(app)/(modals)/family/add_new_family_member",
    });
  }

  async function onDeleteFamily() {
    deleteFamily.mutate({ id: props.family.familyId });
  }

  return (
    <>
      <Components.FamilyCard
        family={props.family}
        onAddNewFamilyMember={onAddNewFamilyMember}
        onDeleteFamily={onDeleteFamily}
        refetchFamilies={props.refetchFamilies}
      />
    </>
  );
}

export default FamilyCard;
