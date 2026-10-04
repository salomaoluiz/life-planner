import { Href, router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { TextInput as RNTextInput } from "react-native";

import { useUser } from "@application/providers/user";
import { useCases } from "@application/useCases";
import {
  clearSessionExpiredNotice,
  hasSessionExpiredNotice,
} from "@infrastructure/api";
import { useMutation } from "@infrastructure/fetcher";
import { addBreadcrumb, captureException } from "@infrastructure/monitoring";
import { useTranslation } from "@presentation/i18n";
import { validateEmail, validateLoginPassword } from "@utils/authValidation";

import mapAuthError, { AuthErrorKey } from "../utils/mapAuthError";

interface SubmitParams {
  email: string;
  password: string;
}

interface SubmitResult {
  errorKey?: AuthErrorKey;
}

async function submitLogin(params: SubmitParams): Promise<SubmitResult> {
  try {
    await useCases.loginWithEmailUseCase.execute(params);
    return {};
  } catch (error) {
    const errorKey = mapAuthError(error);
    if (errorKey === "auth.errors.generic") {
      // The error context comes from the datasource/repository and never carries the credentials.
      captureException(error as Error);
    }
    return { errorKey };
  }
}

function useLoginViewModel() {
  const { t } = useTranslation();
  const { logged, update } = useUser();
  const params = useLocalSearchParams<{ email?: string }>();
  const passwordRef = useRef<RNTextInput>(null);

  const [email, setEmail] = useState(params.email ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [apiErrorKey, setApiErrorKey] = useState<AuthErrorKey>();
  const [sessionExpired, setSessionExpired] = useState(hasSessionExpiredNotice);

  // The fetch function never rejects: failures become form messages, not error boundaries.
  const { isFetching, mutate } = useMutation<SubmitParams, SubmitResult>({
    cacheKey: [useCases.loginWithEmailUseCase.uniqueName],
    fetch: async (submitParams) => {
      const result = await submitLogin(submitParams);

      if (result.errorKey) {
        setApiErrorKey(result.errorKey);
        return result;
      }

      try {
        await update();
      } catch (error) {
        captureException(error as Error);
        setApiErrorKey("auth.errors.generic");
        return { errorKey: "auth.errors.generic" };
      }

      return result;
    },
  });

  function clearFormErrors() {
    setApiErrorKey(undefined);
    setSessionExpired(false);
    clearSessionExpiredNotice();
  }

  function onChangeEmail(text: string) {
    setEmail(text);
    setEmailError(undefined);
    clearFormErrors();
  }

  function onChangePassword(text: string) {
    setPassword(text);
    setPasswordError(undefined);
    clearFormErrors();
  }

  function onSubmit() {
    if (isFetching) return;

    const emailKey = validateEmail(email);
    const passwordKey = validateLoginPassword(password);
    setEmailError(emailKey && t(emailKey));
    setPasswordError(passwordKey && t(passwordKey));
    if (emailKey || passwordKey) return;

    addBreadcrumb({
      category: "user-action",
      level: "info",
      message: "User pressed sign in",
    });
    clearFormErrors();
    mutate({ email: email.trim(), password });
  }

  function getFormError() {
    if (apiErrorKey) {
      return { message: t(apiErrorKey), type: "error" as const };
    }
    if (sessionExpired) {
      return {
        message: t("login.errors.sessionExpired"),
        type: "info" as const,
      };
    }
    return undefined;
  }

  return {
    email,
    emailError,
    formError: getFormError(),
    isSubmitting: isFetching,
    logged,
    onChangeEmail,
    onChangePassword,
    onEmailSubmit: () => passwordRef.current?.focus(),
    onGoToSignUp: () => router.push("/signup" as Href),
    onSubmit,
    onTogglePassword: () => setShowPassword((current) => !current),
    password,
    passwordError,
    passwordRef,
    showPassword,
  };
}

export default useLoginViewModel;
