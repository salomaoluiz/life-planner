import { router } from "expo-router";
import { useEffect, useState } from "react";

import FamilyDTO from "@application/dto/family/FamilyDTO";
import { useUser } from "@application/providers/user";
import { useCases } from "@application/useCases";
import {
  AccountEmailMismatchError,
  UserNotLoggedError,
} from "@domain/entities/errors";
import {
  clearSessionExpiredNotice,
  setAccountDeletedNotice,
} from "@infrastructure/api";
import {
  resetFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import { captureException } from "@infrastructure/monitoring";

interface DeleteResult {
  deleted: boolean;
}

type Step = "closed" | "confirm" | "email";

// A failing families lookup must never block the account deletion itself: the dialog just names no family.
async function fetchFamilies(): Promise<FamilyDTO[]> {
  try {
    return await useCases.getFamiliesUseCase.execute();
  } catch {
    return [];
  }
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function useDeleteAccountViewModel() {
  const { data: user } = useUser();
  const [step, setStep] = useState<Step>("closed");
  const [email, setEmail] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [failed, setFailed] = useState(false);

  const families = useQuery<FamilyDTO[]>({
    cacheKey: [useCases.getFamiliesUseCase.uniqueName],
    fetch: fetchFamilies,
    retry: false,
  });

  // The fetch function never rejects: failures become field/inline messages, not error boundaries.
  const deletion = useMutation<string, DeleteResult>({
    cacheKey: [useCases.deleteAccountUseCase.uniqueName],
    fetch: async (typedEmail) => {
      try {
        await useCases.deleteAccountUseCase.execute({ email: typedEmail });
        return { deleted: true };
      } catch (error) {
        if (error instanceof AccountEmailMismatchError) {
          setMismatch(true);
        } else if (!(error instanceof UserNotLoggedError)) {
          // Network or 5xx. The error context never carries the email.
          setFailed(true);
          captureException(error as Error);
        }
        // UserNotLoggedError: the API client already ran the session-expired flow (back to login).
        return { deleted: false };
      }
    },
  });

  const userEmail = user?.profile.email ?? "";
  const ownedFamilies = (families.data ?? [])
    .filter((family) => family.ownerId === user?.profile.id)
    .map((family) => family.name);

  useEffect(() => {
    if (deletion.status !== "success") {
      return;
    }
    if (deletion.data?.deleted) {
      // Same cleanup as Logout, plus a one-time notice on the login screen.
      clearSessionExpiredNotice();
      setAccountDeletedNotice();
      router.replace("/login");
      void resetFetcherData();
    } else {
      // 401: the session-expired flow is redirecting; close the sheets either way.
      setStep("closed");
    }
  }, [deletion.status, deletion.data]);

  function close() {
    setStep("closed");
    setEmail("");
    setMismatch(false);
    setFailed(false);
  }

  function onCancel() {
    if (deletion.isFetching) return;
    close();
  }

  function onChangeEmail(text: string) {
    setEmail(text);
    setMismatch(false);
    setFailed(false);
  }

  function onContinue() {
    setStep("email");
  }

  function onPress() {
    setStep("confirm");
  }

  const canSubmit =
    !!userEmail && normalizeEmail(email) === normalizeEmail(userEmail);

  function onSubmit() {
    if (deletion.isFetching || !canSubmit) return;
    setMismatch(false);
    setFailed(false);
    deletion.mutate(email.trim());
  }

  return {
    canSubmit,
    email,
    hasError: failed,
    isDeleting: deletion.isFetching,
    isLoadingFamilies: families.isFetching,
    mismatch,
    onCancel,
    onChangeEmail,
    onContinue,
    onPress,
    onSubmit,
    ownedFamilies: ownedFamilies.join(", "),
    step,
    userEmail,
  };
}

export default useDeleteAccountViewModel;
