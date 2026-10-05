import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";

import { useCases } from "@application/useCases";
import {
  InviteFamilyMemberUseCaseParams,
  InviteFamilyMemberUseCaseResponse,
} from "@application/useCases/cases/familyMember/inviteFamilyMemberUseCase";
import { FamilyMemberAlreadyExists } from "@domain/entities/errors";
import { copyText } from "@infrastructure/clipboard";
import { invalidateFetcherData, useMutation } from "@infrastructure/fetcher";
import { isShareAvailable, shareText } from "@infrastructure/share";
import { TranslationKeys } from "@presentation/i18n/types";
import { buildInviteLink } from "@screens/Family/utils/inviteLink";
import { validateEmail } from "@utils/authValidation";

const COPIED_MS = 2000;

function useAddNewFamilyMemberViewModel() {
  const { familyId, familyName } = useLocalSearchParams<{
    familyId: string;
    familyName?: string;
  }>();
  const [email, setEmail] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const invite = useMutation<
    InviteFamilyMemberUseCaseParams,
    InviteFamilyMemberUseCaseResponse
  >({
    cacheKey: [useCases.inviteFamilyMemberUseCase.uniqueName],
    fetch: useCases.inviteFamilyMemberUseCase.execute,
  });

  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );

  // The token exists only in the mutation result: it is shown once, in this sheet.
  const link = invite.data
    ? buildInviteLink(
        process.env.EXPO_PUBLIC_PROJECT_WEBSITE_URL,
        invite.data.inviteToken,
      )
    : undefined;

  const trimmed = email.trim();
  const validationKey = validateEmail(email);
  const alreadyExists =
    invite.error instanceof FamilyMemberAlreadyExists &&
    submittedEmail === trimmed;

  function getEmailErrorKey(): TranslationKeys | undefined {
    if (showValidation && validationKey) {
      return validationKey;
    }

    return alreadyExists ? "family.member.invite.alreadyExists" : undefined;
  }

  function onSubmit() {
    setShowValidation(true);

    if (validationKey || invite.isFetching) {
      return;
    }

    setSubmittedEmail(trimmed);
    invite.mutate({ email: trimmed, familyId });
  }

  function onDone() {
    if (link) {
      invalidateFetcherData();
    }

    router.back();
  }

  async function onCopy() {
    if (!link) {
      return;
    }

    await copyText(link);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  }

  async function onShare() {
    if (link) {
      await shareText(link);
    }
  }

  return {
    copied,
    email,
    emailErrorKey: getEmailErrorKey(),
    familyName,
    hasGenericError:
      !!invite.error && !(invite.error instanceof FamilyMemberAlreadyExists),
    isSubmitting: invite.isFetching,
    link,
    onChangeEmail: setEmail,
    onClose: onDone,
    onCopy,
    onDone,
    onShare,
    onSubmit,
    resultEmail: submittedEmail,
    shareAvailable: isShareAvailable(),
  };
}

export default useAddNewFamilyMemberViewModel;
