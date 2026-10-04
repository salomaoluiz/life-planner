import {
  validateConfirmPassword,
  validateEmail,
  validateLoginPassword,
  validateName,
  validateNewPassword,
} from "./authValidation";

it.each([
  ["", "auth.validation.emailRequired"],
  ["   ", "auth.validation.emailRequired"],
  ["nope", "auth.validation.emailInvalid"],
  ["a@b", "auth.validation.emailInvalid"],
  [`${"a".repeat(250)}@b.co`, "auth.validation.emailInvalid"],
  [" Test@Example.com ", undefined],
])("SHOULD validate email %j → %s", (value, expected) => {
  expect(validateEmail(value)).toBe(expected);
});

it("SHOULD require the login password but accept any length", () => {
  expect(validateLoginPassword("")).toBe("auth.validation.passwordRequired");
  expect(validateLoginPassword("abc")).toBeUndefined();
});

it.each([
  ["", "auth.validation.passwordRequired"],
  ["1234567", "auth.validation.passwordLength"],
  ["a".repeat(73), "auth.validation.passwordLength"],
  ["12345678", undefined],
  ["a".repeat(72), undefined],
])("SHOULD validate new password %j → %s", (value, expected) => {
  expect(validateNewPassword(value)).toBe(expected);
});

it.each([
  ["", "auth.validation.nameRequired"],
  ["   ", "auth.validation.nameRequired"],
  ["a".repeat(101), "auth.validation.nameTooLong"],
  [" Ana ", undefined],
  ["a".repeat(100), undefined],
])("SHOULD validate name %j → %s", (value, expected) => {
  expect(validateName(value)).toBe(expected);
});

it("SHOULD require matching passwords", () => {
  expect(validateConfirmPassword("12345678", "1234567x")).toBe(
    "auth.validation.passwordsDontMatch",
  );
  expect(validateConfirmPassword("12345678", "12345678")).toBeUndefined();
});
