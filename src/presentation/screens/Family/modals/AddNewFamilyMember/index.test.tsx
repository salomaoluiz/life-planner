import {
  fireEvent,
  hasText,
  mocks,
  press,
  screen,
  setup,
} from "./mocks/index.mocks";

it("SHOULD render the title, input label and actions as i18n keys", () => {
  setup();

  expect(hasText("family.member.invite.title")).toBe(true);
  expect(
    screen.UNSAFE_getAllByProps({ label: "family.member.invite.emailLabel" })
      .length,
  ).toBeGreaterThan(0);
  expect(
    screen.UNSAFE_getAllByProps({ label: "family.member.invite.submit" })
      .length,
  ).toBeGreaterThan(0);
  expect(
    screen.UNSAFE_getAllByProps({ label: "family.member.invite.cancel" })
      .length,
  ).toBeGreaterThan(0);
});

it("SHOULD forward typing to onChangeEmail", () => {
  const vm = setup();

  fireEvent.changeText(
    screen.UNSAFE_getAllByProps({ value: "" })[0],
    "bob@example.test",
  );

  expect(vm.onChangeEmail).toHaveBeenCalledWith("bob@example.test");
});

it("SHOULD call onSubmit WHEN submit is pressed", () => {
  const vm = setup();

  press("family.member.invite.submit");

  expect(vm.onSubmit).toHaveBeenCalledTimes(1);
});

it("SHOULD call onCancel WHEN Cancel or the backdrop is pressed", () => {
  const vm = setup();

  press("family.member.invite.cancel");
  fireEvent.press(screen.UNSAFE_getAllByType(mocks.Pressable)[0]);

  expect(vm.onCancel).toHaveBeenCalledTimes(2);
});

it("SHOULD show the validation message key WHEN there is an email error", () => {
  setup({ emailErrorKey: "auth.validation.emailInvalid" });

  expect(hasText("auth.validation.emailInvalid")).toBe(true);
});

it("SHOULD NOT show any error text by default", () => {
  setup();

  expect(hasText("auth.validation.emailInvalid")).toBe(false);
  expect(hasText("family.member.invite.alreadyExists")).toBe(false);
});

it("SHOULD show the 'already exists' message WHEN flagged", () => {
  setup({ alreadyExistsVisible: true });

  expect(hasText("family.member.invite.alreadyExists")).toBe(true);
});

it("SHOULD disable the submit button WHILE submitting", () => {
  setup({ isSubmitting: true });

  expect(
    screen.UNSAFE_getAllByProps({ label: "family.member.invite.submit" })[0]
      .props.disabled,
  ).toBe(true);
});
