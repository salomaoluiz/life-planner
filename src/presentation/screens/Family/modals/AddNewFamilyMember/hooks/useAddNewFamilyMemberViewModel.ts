import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";

import { useCases } from "@application/useCases";
import { InviteFamilyMemberUseCaseResponse } from "@application/useCases/cases/familyMember/inviteFamilyMemberUseCase";
import { FamilyMemberAlreadyExists } from "@domain/entities/errors";
import { useMutation } from "@infrastructure/fetcher";
import { useTranslation } from "@presentation/i18n";
import {
  FeedbackActions,
  FeedbackNavigationTypes,
} from "@screens/Feedback/BusinessFeedback/actions/types";
import { FeedbackType } from "@screens/Feedback/BusinessFeedback/types";
import { createFeedbackRouteEncoded } from "@screens/Feedback/BusinessFeedback/utils";
import { validateEmail } from "@utils/authValidation";

function useAddNewFamilyMemberViewModel() {
  const { familyId } = useLocalSearchParams<{ familyId: string }>();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState<string>();
  const [showValidation, setShowValidation] = useState(false);

  // The email is personal data: it is kept out of the mutation variables, which
  // useMutation copies into error contexts (sent to monitoring).
  const pendingEmail = useRef("");

  const invite = useMutation<void, InviteFamilyMemberUseCaseResponse>({
    cacheKey: [useCases.inviteFamilyMemberUseCase.uniqueName],
    fetch: async () =>
      useCases.inviteFamilyMemberUseCase.execute({
        email: pendingEmail.current,
        familyId,
      }),
  });

  // Imperative navigation text: the only place this hook translates.
  async function showSuccessFeedback(inviteToken: string) {
    const encodedRoute = await createFeedbackRouteEncoded({
      closeButton: {
        action: FeedbackActions.NAVIGATION,
        route: "/family",
        type: FeedbackNavigationTypes.DISMISS_TO,
      },
      message: t("family.member.invite.successMessage", {
        email: submittedEmail,
      }),
      primaryButton: {
        action: FeedbackActions.COPY_TO_CLIPBOARD,
        label: t("family.member.invite.copyLink"),
        value: `${process.env.EXPO_PUBLIC_PROJECT_WEBSITE_URL}/invite?token=${inviteToken}`,
      },
      title: t("family.member.invite.successTitle"),
      type: FeedbackType.Success,
    });

    router.push({ params: encodedRoute, pathname: "/business_feedback" });
  }

  useEffect(() => {
    if (invite.data) {
      showSuccessFeedback(invite.data.inviteToken);
    }
  }, [invite.data]);

  const trimmedEmail = email.trim();
  const validationKey = validateEmail(email);

  function onChangeEmail(value: string) {
    setEmail(value);
  }

  function onSubmit() {
    setShowValidation(true);

    if (validationKey) {
      return;
    }

    setSubmittedEmail(trimmedEmail);
    pendingEmail.current = trimmedEmail;
    invite.mutate();
  }

  function onCancel() {
    router.back();
  }

  return {
    alreadyExistsVisible:
      invite.error instanceof FamilyMemberAlreadyExists &&
      trimmedEmail === submittedEmail,
    email,
    emailErrorKey: showValidation ? validationKey : undefined,
    isSubmitting: invite.isFetching,
    onCancel,
    onChangeEmail,
    onSubmit,
  };
}

export default useAddNewFamilyMemberViewModel;
