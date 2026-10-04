import { Href, router } from "expo-router";
import { useRef, useState } from "react";
import { TextInput as RNTextInput } from "react-native";

import { useUser } from "@application/providers/user";
import { useCases } from "@application/useCases";
import { AutoLoginFailedError } from "@domain/entities/errors";
import { useMutation } from "@infrastructure/fetcher";
import { addBreadcrumb, captureException } from "@infrastructure/monitoring";
import { useTranslation } from "@presentation/i18n";
import mapAuthError, { AuthErrorKey } from "@screens/Login/utils/mapAuthError";
import {
  validateConfirmPassword,
  validateEmail,
  validateName,
  validateNewPassword,
} from "@utils/authValidation";

interface SubmitParams {
  email: string;
  name: string;
  password: string;
}

interface SubmitResult {
  autoLoginFailed?: boolean;
  errorKey?: AuthErrorKey;
}

async function submitSignUp(params: SubmitParams): Promise<SubmitResult> {
  try {
    await useCases.signUpWithEmailUseCase.execute(params);
    return {};
  } catch (error) {
    if (error instanceof AutoLoginFailedError) {
      return { autoLoginFailed: true };
    }
    const errorKey = mapAuthError(error);
    if (errorKey === "auth.errors.generic") {
      // The error context comes from the datasource/repository and never carries the credentials.
      captureException(error as Error);
    }
    return { errorKey };
  }
}

function useSignupViewModel() {
  const { t } = useTranslation();
  const { logged, update } = useUser();
  const refs = {
    confirmPassword: useRef<RNTextInput>(null),
    email: useRef<RNTextInput>(null),
    password: useRef<RNTextInput>(null),
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>();
  const [apiErrorKey, setApiErrorKey] = useState<AuthErrorKey>();

  // The fetch function never rejects: failures become form messages, not error boundaries.
  const { isFetching, mutate } = useMutation<SubmitParams, SubmitResult>({
    cacheKey: [useCases.signUpWithEmailUseCase.uniqueName],
    fetch: async (submitParams) => {
      const result = await submitSignUp(submitParams);

      if (result.autoLoginFailed) {
        // The account exists: let the person sign in manually with the email prefilled.
        router.replace({
          params: { email: submitParams.email },
          pathname: "/login",
        } as Href);
        return result;
      }

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

  function onChangeName(text: string) {
    setName(text);
    setNameError(undefined);
    setApiErrorKey(undefined);
  }

  function onChangeEmail(text: string) {
    setEmail(text);
    setEmailError(undefined);
    setApiErrorKey(undefined);
  }

  function onChangePassword(text: string) {
    setPassword(text);
    setPasswordError(undefined);
    setApiErrorKey(undefined);
  }

  function onChangeConfirmPassword(text: string) {
    setConfirmPassword(text);
    setConfirmPasswordError(undefined);
    setApiErrorKey(undefined);
  }

  function onSubmit() {
    if (isFetching) return;

    const nameKey = validateName(name);
    const emailKey = validateEmail(email);
    const passwordKey = validateNewPassword(password);
    const confirmKey = validateConfirmPassword(password, confirmPassword);
    setNameError(nameKey && t(nameKey));
    setEmailError(emailKey && t(emailKey));
    setPasswordError(passwordKey && t(passwordKey));
    setConfirmPasswordError(confirmKey && t(confirmKey));
    if (nameKey || emailKey || passwordKey || confirmKey) return;

    addBreadcrumb({
      category: "user-action",
      level: "info",
      message: "User pressed create account",
    });
    setApiErrorKey(undefined);
    mutate({ email: email.trim(), name: name.trim(), password });
  }

  return {
    confirmPassword,
    confirmPasswordError,
    email,
    emailError,
    formError: apiErrorKey && t(apiErrorKey),
    isSubmitting: isFetching,
    logged,
    name,
    nameError,
    onChangeConfirmPassword,
    onChangeEmail,
    onChangeName,
    onChangePassword,
    onEmailSubmit: () => refs.password.current?.focus(),
    onGoToLogin: () => router.replace("/login"),
    onNameSubmit: () => refs.email.current?.focus(),
    onPasswordSubmit: () => refs.confirmPassword.current?.focus(),
    onSubmit,
    onTogglePassword: () => setShowPassword((current) => !current),
    password,
    passwordError,
    refs,
    showPassword,
  };
}

export default useSignupViewModel;
