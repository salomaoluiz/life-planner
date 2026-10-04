export type AuthValidationKey =
  | "auth.validation.emailInvalid"
  | "auth.validation.emailRequired"
  | "auth.validation.nameRequired"
  | "auth.validation.nameTooLong"
  | "auth.validation.passwordLength"
  | "auth.validation.passwordRequired"
  | "auth.validation.passwordsDontMatch";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateConfirmPassword(
  password: string,
  confirm: string,
): AuthValidationKey | undefined {
  return password === confirm
    ? undefined
    : "auth.validation.passwordsDontMatch";
}

function validateEmail(value: string): AuthValidationKey | undefined {
  const email = value.trim();

  if (!email) return "auth.validation.emailRequired";
  if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    return "auth.validation.emailInvalid";
  }
  return undefined;
}

function validateLoginPassword(value: string): AuthValidationKey | undefined {
  return value ? undefined : "auth.validation.passwordRequired";
}

function validateName(value: string): AuthValidationKey | undefined {
  const name = value.trim();

  if (!name) return "auth.validation.nameRequired";
  if (name.length > 100) return "auth.validation.nameTooLong";
  return undefined;
}

function validateNewPassword(value: string): AuthValidationKey | undefined {
  if (!value) return "auth.validation.passwordRequired";
  if (value.length < 8 || value.length > 72) {
    return "auth.validation.passwordLength";
  }
  return undefined;
}

export {
  validateConfirmPassword,
  validateEmail,
  validateLoginPassword,
  validateName,
  validateNewPassword,
};
